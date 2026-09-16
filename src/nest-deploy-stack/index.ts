import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { spawnSync } from 'child_process';
import * as fs from 'fs';

export function nestDeployStack(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('☁️  [deploy-stack] Scaffolding AWS Fargate & RDS infrastructure for NestJS...');

    const region = options.aws_region || 'us-east-2';
    const needsDatabase = options.include_managed_rds ? 'true' : 'false';
    const port = String(options.port || 3000);

    // 1. AST Modification: Auto-patch src/main.ts for Docker compatibility
    const mainTsPath = 'src/main.ts';
    if (fs.existsSync(mainTsPath)) {
      let content = tree.read(mainTsPath)?.toString('utf-8');

      if (content) {
        const listenRegex = /(await\s+app\.listen\([^,)]+)/;

        if (listenRegex.test(content) && !content.includes("'0.0.0.0'")) {
          content = content.replace(listenRegex, "$1, '0.0.0.0'");

          fs.writeFileSync(mainTsPath, content, 'utf-8');
          tree.overwrite(mainTsPath, content);

          context.logger.info('🔧 [deploy-stack] Auto-patched src/main.ts to bind to 0.0.0.0 for Docker compatibility.');
        }
      }
    } else {
      context.logger.warn('⚠️  [deploy-stack] Could not find src/main.ts. Ensure your app listens on 0.0.0.0 manually.');
    }

    // 2. Execute core deploy-stack CLI
    const isWin = process.platform === 'win32';
    const cmdExecutable = isWin ? 'npx.cmd' : 'npx';
    const args = [
      '--yes',
      'deploy-stack@latest',
      '--headless',
      '--framework=nestjs',
      '--preconfigured',
      `--region=${region}`,
      `--needsDatabase=${needsDatabase}`,
      `--port=${port}`,
    ];

    context.logger.info(`Running: npx ${args.join(' ')}`);

    const result = spawnSync(cmdExecutable, args, {
      stdio: 'inherit',
      shell: false,
    });

    if (result.status !== 0) {
      context.logger.error('❌ [deploy-stack] Infrastructure generation failed.');
      throw new Error('deploy-stack generation failed');
    }

    context.logger.info('✅ [deploy-stack] AWS infrastructure successfully generated!');
    return tree;
  };
}
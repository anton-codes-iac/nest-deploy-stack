# nest-deploy-stack ☁️🚀

[![NPM Version](https://img.shields.io/npm/v/nest-deploy-stack.svg?color=blue)](https://www.npmjs.com/package/nest-deploy-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official **[deploy-stack](https://github.com/anton-codes-iac/deploy-stack)** integration for NestJS. 

`nest-deploy-stack` is a native Angular DevKit Schematic that bridges your NestJS application and AWS. By simply running a generator, it automatically scaffolds a production-ready AWS Fargate architecture directly into your repository.

**What it generates under the hood:**
* **Compute & Networking:** An AWS ECS Fargate cluster, Application Load Balancer, and an optional managed Amazon RDS PostgreSQL database.
* **DevSecOps CI/CD:** A GitHub Actions workflow utilizing keyless IAM OIDC and automated Trivy container vulnerability scanning.
* **Smart Code Patching:** Safely modifies your NestJS AST (`src/main.ts`) to ensure your app binds correctly to `0.0.0.0` for Docker/AWS traffic routing.
* **State Management:** Native Terraform templates with an encrypted S3 remote state backend.

---

## 📦 Installation & Usage

In the root of your existing NestJS project, install the schematic as a development dependency:

```bash
npm install -D nest-deploy-stack
```

Then, use the Nest CLI to execute the generator:

```bash
npx @nestjs/cli generate nestDeployStack --collection nest-deploy-stack
```

You will be prompted for:
1. `aws_region`: Target AWS region for deployment (e.g., `us-east-2`).
2. `include_managed_rds`: Select `Yes` to automatically provision and securely attach an Amazon RDS PostgreSQL database.
3. `port`: The port your NestJS app listens on (default: `3000`).

Once the schematic runs, it will auto-patch your `main.ts`, generate a zero-CVE Dockerfile, and create your `terraform/` and `.github/` directories natively.

## 🚀 Deployment (Day 1)

After the schematic successfully generates your infrastructure templates, provision them to your real AWS account by running:

```bash
npx --yes deploy-stack apply
```

*(Note: If you enabled an RDS database, push your local API secrets to the newly created AWS Vault using `npx deploy-stack secrets push .env` before pushing your code to GitHub).*

## 🔄 Automation (Day 2)

Push your code to GitHub. The generated GitHub Actions CI/CD pipeline will automatically build your Docker image, scan it for vulnerabilities using Trivy, and deploy the new task definition to AWS Fargate securely via IAM OIDC.

## 🗑️ Teardown (Stopping AWS Billing)

To remove all provisioned infrastructure, destroy the database, and stop billing, run:
```bash
npx --yes deploy-stack destroy
```

## 🎮 Live Example

Want to see the resulting architecture in action? Check out the **[deploy-stack-nest-example](https://github.com/anton-codes-iac/deploy-stack-nest-example)** repository.

## 🧠 Powered by deploy-stack

This schematic is a headless automation wrapper around the core `deploy-stack` CLI. For custom architectures, full CLI flags, or supporting other web frameworks, visit the main [deploy-stack repository](https://github.com/anton-codes-iac/deploy-stack).

## 💰 AWS Costs & Disclaimer
**This tool provisions real AWS resources which will incur charges on your AWS bill.** An ECS Fargate cluster with an Application Load Balancer running 24/7 typically costs around ~$15 - $20/month minimum, depending on your region. A managed RDS database will add additional monthly costs.

*Disclaimer: The maintainers are not responsible for unexpected AWS charges. Always monitor your AWS Billing Dashboard.*
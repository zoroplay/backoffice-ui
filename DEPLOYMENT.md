# Deployment Guide

## GitHub Secrets Configuration

Before deploying, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **GCP_SERVER_IP**
   - Description: The IP address of your GCP server
   - Example: `34.123.45.67`
   - How to add: Go to GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

2. **GCP_SERVER_USER**
   - Description: The SSH username for your GCP server
   - Example: `ubuntu` or `devops`
   - How to add: Go to GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

3. **GCP_SSH_PRIVATE_KEY**
   - Description: The private SSH key for accessing your GCP server
   - How to generate:
     ```bash
     ssh-keygen -t rsa -b 4096 -C "github-actions@your-domain.com"
     ```
   - Copy the entire content of the private key file (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
   - Add the public key to your server's `~/.ssh/authorized_keys`
   - How to add: Go to GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

### Environment Configuration

The workflow uses the `GCP CI` environment. Make sure this environment is configured in:
- GitHub Repository → Settings → Environments → GCP CI

## Deployment Process

The CI/CD pipeline consists of 4 jobs:

1. **Version**: Generates a version number based on timestamp
2. **Build**: Builds and pushes Docker image to GitHub Container Registry
3. **Release**: Creates a GitHub release using semantic-release
4. **Deploy**: Deploys the application to your GCP server

### Manual Deployment

If you need to deploy manually:

1. SSH into your server
2. Navigate to the deployment directory:
   ```bash
   cd ~/bo-ui
   ```
3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

## Docker Configuration

- **Image**: `ghcr.io/zoroplay/bo-ui:latest`
- **Port Mapping**: `8089:3003` (external:internal)
- **Network**: `sbenet` (external network)

## Troubleshooting

### Build Failures

If the build fails due to linting or TypeScript errors:
- The `build:ci` script skips ESLint checks
- TypeScript errors can be skipped by setting `SKIP_TYPE_CHECK=true`

### Deployment Failures

If deployment fails:
1. Check that all GitHub secrets are properly configured
2. Verify SSH access to your server
3. Ensure the `sbenet` Docker network exists on your server
4. Check server logs: `docker logs <container-id>`

### Network Issues

If the container can't connect to other services:
```bash
# Create the network if it doesn't exist
docker network create sbenet

# Verify the network exists
docker network ls
```

## Server Requirements

- Docker and Docker Compose installed
- SSH access configured
- Port 8089 available
- Network `sbenet` created

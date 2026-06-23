import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

// Retrieve GCP configs from Pulumi config system
const gcpProject = gcp.config.project || "intern-gcp-project-101";
const gcpRegion = gcp.config.region || "asia-southeast1";

console.log(`[Midterm] Starting Pulumi deploy to Project: ${gcpProject} in Region: ${gcpRegion}`);

// 1. Create Artifact Registry Repository for Midterm images
const repo = new gcp.artifactregistry.Repository("midterm-repo", {
    repositoryId: "midterm-docker-repo",
    location: gcpRegion,
    format: "DOCKER",
    description: "Docker repository for Midterm project",
});

// 2. Build and Push the Docker Image from ../app
const appImage = new docker.Image("midterm-app-image", {
    imageName: pulumi.interpolate`${gcpRegion}-docker.pkg.dev/${gcpProject}/${repo.repositoryId}/midterm-app-image:latest`,
    build: {
        context: "../app", // Path to the app folder relative to the infra folder
    },
});

// 3. Deploy the container image to Google Cloud Run (v1 Service)
const service = new gcp.cloudrun.Service("midterm-cloud-run", {
    name: "midterm-cloud-run-service",
    location: gcpRegion,
    template: {
        spec: {
            containers: [{
                image: appImage.imageName,
                ports: [{ containerPort: 8080 }],
                envs: [
                    { name: "NODE_ENV", value: "production" },
                    { name: "AUTHOR", value: "Võ Văn Khánh" }
                ]
            }],
            serviceAccountName: "midterm-app-runtime@intern-gcp-project-101.iam.gserviceaccount.com", // Gán SA bảo mật
        },
    },
    traffics: [{
        percent: 100,
        latestRevision: true,
    }],
});

// 4. Grant public access to the Cloud Run service (Allow Unauthenticated)
const publicAccess = new gcp.cloudrun.IamMember("midterm-public-access", {
    location: service.location,
    service: service.name,
    role: "roles/run.invoker",
    member: "allUsers",
});

// Export output values
export const repositoryName = repo.name;
export const imageUrl = appImage.imageName;
export const serviceUrl = service.statuses[0].url;

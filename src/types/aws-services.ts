// AWS Services catalog with icon mappings

export interface AWSService {
  id: string;
  name: string;
  category: string;
  iconPath: string; // Local path to icon
  description?: string;
}

export const AWS_SERVICES: AWSService[] = [
  // Compute
  { id: 'ec2', name: 'EC2', category: 'Compute', iconPath: '/aws-icons/compute/ec2.svg', description: 'Virtual Servers' },
  { id: 'lambda', name: 'Lambda', category: 'Serverless', iconPath: '/aws-icons/compute/lambda.svg', description: 'Serverless Functions' },
  { id: 'ecs', name: 'ECS', category: 'Container', iconPath: '/aws-icons/compute/ecs.svg', description: 'Container Service' },
  { id: 'eks', name: 'EKS', category: 'Container', iconPath: '/aws-icons/compute/eks.svg', description: 'Kubernetes Service' },

  // Storage
  { id: 's3', name: 'S3', category: 'Storage', iconPath: '/aws-icons/storage/s3.svg', description: 'Object Storage' },
  { id: 'ebs', name: 'EBS', category: 'Storage', iconPath: '/aws-icons/storage/ebs.svg', description: 'Block Storage' },
  { id: 'efs', name: 'EFS', category: 'Storage', iconPath: '/aws-icons/storage/efs.svg', description: 'File Storage' },

  // Database
  { id: 'rds', name: 'RDS', category: 'Database', iconPath: '/aws-icons/database/rds.svg', description: 'Relational Database' },
  { id: 'dynamodb', name: 'DynamoDB', category: 'Database', iconPath: '/aws-icons/database/dynamodb.svg', description: 'NoSQL Database' },
  { id: 'elasticache', name: 'ElastiCache', category: 'Database', iconPath: '/aws-icons/database/elasticache.svg', description: 'In-Memory Cache' },

  // Networking
  { id: 'vpc', name: 'VPC', category: 'Networking', iconPath: '/aws-icons/networking/vpc.svg', description: 'Virtual Private Cloud' },
  { id: 'cloudfront', name: 'CloudFront', category: 'Networking', iconPath: '/aws-icons/networking/cloudfront.svg', description: 'CDN' },
  { id: 'route53', name: 'Route 53', category: 'Networking', iconPath: '/aws-icons/networking/route53.svg', description: 'DNS Service' },
  { id: 'alb', name: 'ALB', category: 'Networking', iconPath: '/aws-icons/networking/alb.svg', description: 'Application Load Balancer' },

  // Security
  { id: 'iam', name: 'IAM', category: 'Security', iconPath: '/aws-icons/security/iam.svg', description: 'Identity & Access' },
  { id: 'cognito', name: 'Cognito', category: 'Security', iconPath: '/aws-icons/security/cognito.svg', description: 'User Authentication' },
  { id: 'waf', name: 'WAF', category: 'Security', iconPath: '/aws-icons/security/waf.svg', description: 'Web Application Firewall' },

  // Analytics
  { id: 'athena', name: 'Athena', category: 'Analytics', iconPath: '/aws-icons/analytics/athena.svg', description: 'Query Service' },
  { id: 'kinesis', name: 'Kinesis', category: 'Analytics', iconPath: '/aws-icons/analytics/kinesis.svg', description: 'Real-time Streaming' },

  // ML
  { id: 'sagemaker', name: 'SageMaker', category: 'ML', iconPath: '/aws-icons/ml/sagemaker.svg', description: 'Machine Learning' },
];

export const getServicesByCategory = (category: string): AWSService[] => {
  return AWS_SERVICES.filter(s => s.category === category);
};

export const getServiceById = (id: string): AWSService | undefined => {
  return AWS_SERVICES.find(s => s.id === id);
};

# Image Analysis

The Image Analysis is a simple project using Aws Lambda, AWS Rekognition and AWS Translate with base on Serveless Framework.

## Usage

### Deployment
In order to deploy the example, you need to run the following command:
```
$ serverless deploy
```

### Local development

  

After successful deployment, you can invoke the deployed function by using the following command:

  

```bash

sls invoke local -f image-analisys --path request.json

```

Which should result in response similar to the following:

  

```json

{
    "statusCode": 200,
    "body": "A imagem tem 98.67% de ser do tipo Cão\n98.67% de ser do tipo canino\n98.67% de ser do tipo animal de estimação\n98.67% de ser do tipo animal\n98.67% de ser do tipo mamífero\n95.29% de ser do tipo buldogue\n88.34% de ser do tipo buldogue francês"
}

```
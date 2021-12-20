#!/bin/sh

set -ex

yarn run sls deploy -c ok.yaml --verbose --region us-east-1 
yarn run sls deploy -c ok.yaml --verbose --region us-east-2
yarn run sls deploy -c ok.yaml --verbose --region us-west-1
yarn run sls deploy -c ok.yaml --verbose --region us-west-2
yarn run sls deploy -c ok.yaml --verbose --region eu-central-1
yarn run sls deploy -c ok.yaml --verbose --region eu-west-1
yarn run sls deploy -c ok.yaml --verbose --region eu-west-2
yarn run sls deploy -c ok.yaml --verbose --region eu-south-1
yarn run sls deploy -c ok.yaml --verbose --region eu-west-3
yarn run sls deploy -c ok.yaml --verbose --region eu-north-1
yarn run sls deploy -c ok.yaml --verbose --region ap-east-1
yarn run sls deploy -c ok.yaml --verbose --region ap-south-1
yarn run sls deploy -c ok.yaml --verbose --region ap-northeast-3
yarn run sls deploy -c ok.yaml --verbose --region ap-northeast-2
yarn run sls deploy -c ok.yaml --verbose --region ap-southeast-1
yarn run sls deploy -c ok.yaml --verbose --region ap-southeast-2
yarn run sls deploy -c ok.yaml --verbose --region ap-northeast-1
yarn run sls deploy -c ok.yaml --verbose --region ca-central-1
yarn run sls deploy -c ok.yaml --verbose --region me-south-1
yarn run sls deploy -c ok.yaml --verbose --region sa-east-1
yarn run sls deploy -c ok.yaml --verbose --region af-south-1
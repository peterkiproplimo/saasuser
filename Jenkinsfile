pipeline {
    agent any

    environment {
        DEPLOY_PATH = '/var/www/html/saas-product'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://bitbucket.org/unison-crm/saas-user.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                echo "Installing dependencies..."
                npm install --force
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                echo "Building the project..."
                npm run build --if-present || ng build --configuration production
                '''
            }
        }

        stage('Deploy to Server') {
            steps {
                sh '''
                echo "Deploying build to ${DEPLOY_PATH}..."
                sudo rm -rf ${DEPLOY_PATH}/*
                sudo mkdir -p ${DEPLOY_PATH}

                # Copy the correct output (Angular 17+ uses dist/browser)
                if [ -d "dist/browser" ]; then
                    sudo cp -r dist/browser/* ${DEPLOY_PATH}/
                elif [ -d "dist/saas-product/browser" ]; then
                    sudo cp -r dist/saas-product/browser/* ${DEPLOY_PATH}/
                elif [ -d "browser" ]; then
                    sudo cp -r browser/* ${DEPLOY_PATH}/
                else
                    echo "❌ Build folder not found!"
                    exit 1
                fi

                echo "✅ Deployment complete!"
                ls -la ${DEPLOY_PATH}
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build and deployment successful!'
        }
        failure {
            echo '❌ Build or deployment failed!'
        }
    }
}

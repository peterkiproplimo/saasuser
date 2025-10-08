pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        DEPLOY_DIR = '/var/www/html/saas-product'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔹 Checking out code...'
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                echo "🔹 Setting up Node.js ${NODE_VERSION}"
                sh """
                    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    node -v
                    npm -v
                """
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '🔹 Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Build Angular App') {
            steps {
                echo '🔹 Building Angular project...'
                sh 'npm run build --prod'
            }
        }

        stage('Deploy to Server') {
            steps {
                echo '🔹 Deploying build to /var/www/html/saas-product ...'
                // Replace existing build with the new one
                sh """
                    sudo rm -rf ${DEPLOY_DIR}/*
                    sudo cp -r dist/* ${DEPLOY_DIR}/
                    sudo chown -R www-data:www-data ${DEPLOY_DIR}
                    sudo chmod -R 755 ${DEPLOY_DIR}
                """
            }
        }
    }

    post {
        success {
            echo '✅ Build and deployment completed successfully!'
        }
        failure {
            echo '❌ Build or deployment failed. Check logs for details.'
        }
    }
}

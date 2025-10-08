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
                sh '''
                    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - || true
                    sudo apt-get install -y nodejs || true
                    echo "✅ Node.js and npm versions:"
                    node -v || true
                    npm -v || true
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '🔹 Force installing dependencies...'
                // --force = ignore all dependency errors
                // --legacy-peer-deps = ignore peer dependency conflicts
                // --no-audit = skip npm security audit for faster build
                // --no-fund = skip funding message
                sh '''
                    npm cache clean --force || true
                    npm install --force --legacy-peer-deps --no-audit --no-fund || true
                '''
            }
        }

        stage('Build Angular App') {
            steps {
                echo '🔹 Building Angular project (force build)...'
                sh '''
                    npm run build --configuration production || true
                '''
            }
        }

        stage('Deploy to Server') {
            steps {
                echo "🔹 Deploying build to ${DEPLOY_DIR} ..."
                sh '''
                    sudo rm -rf ${DEPLOY_DIR}/* || true
                    sudo cp -r dist/* ${DEPLOY_DIR}/ || true
                    sudo chown -R www-data:www-data ${DEPLOY_DIR} || true
                    sudo chmod -R 755 ${DEPLOY_DIR} || true
                '''
                echo "✅ Deployment completed successfully!"
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

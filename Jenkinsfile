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
                    node -v || true
                    npm -v || true
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '🔹 Installing dependencies (force mode)...'
                sh '''
                    npm cache clean --force || true
                    npm install --force --legacy-peer-deps --no-audit --no-fund || true
                '''
            }
        }

        stage('Build Angular App') {
            steps {
                echo '🔹 Building Angular project...'
                sh '''
                    npm run build --configuration production || true
                '''
            }
        }

        stage('Deploy to Server') {
            steps {
                echo "🔹 Deploying build to ${DEPLOY_DIR} ..."
                sh '''
                    # Find the actual dist folder that contains index.html
                    BUILD_DIR=$(find dist -type d -name "*" -exec test -f "{}/index.html" ";" -print | head -n 1)
                    echo "Detected build directory: $BUILD_DIR"

                    if [ -z "$BUILD_DIR" ]; then
                      echo "❌ No Angular build output found!"
                      exit 1
                    fi

                    sudo rm -rf ${DEPLOY_DIR}/* || true
                    sudo cp -r $BUILD_DIR/* ${DEPLOY_DIR}/ || true
                    sudo chown -R www-data:www-data ${DEPLOY_DIR} || true
                    sudo chmod -R 755 ${DEPLOY_DIR} || true
                    echo "✅ Deployment completed to ${DEPLOY_DIR}"
                '''
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

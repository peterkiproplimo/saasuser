pipeline {
    agent any
    options {
        disableConcurrentBuilds()
        skipDefaultCheckout()
    }

    environment {
        APP_ROOT = '/var/lib/jenkins/saas-user'
        DEPLOY_PATH = '/var/www/html/saas-product'
        PATH = "/usr/bin:/usr/local/bin:/var/lib/jenkins/.nvm/versions/node/v20.0.0/bin:${env.PATH}"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                echo '🧹 Cleaning workspace...'
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                echo '🔹 Checking out source code from Bitbucket...'
                script {
                    sh "rm -rf ${APP_ROOT}/saas-frontend || true"
                    sh "mkdir -p ${APP_ROOT}/saas-frontend"
                    dir("${APP_ROOT}/saas-frontend") {
                        git branch: 'main', 
                            credentialsId: 'Bitbucket',
                            url: 'https://bitbucket.org/unison-crm/saas-user.git'
                    }
                }
            }
        }

        stage('Setup Node.js') {
            steps {
                echo '🔹 Ensuring Node.js v20 is installed...'
                sh '''
                    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                    sudo apt-get install -y nodejs
                    node -v
                    npm -v
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing dependencies (clean, forced)...'
                sh """
                    cd ${APP_ROOT}/saas-frontend
                    npm cache clean --force
                    rm -rf node_modules package-lock.json
                    npm install --force --legacy-peer-deps --no-audit --no-fund
                """
            }
        }

        stage('Build Angular App') {
            steps {
                echo '🏗️ Building Angular project...'
                sh """
                    cd ${APP_ROOT}/saas-frontend
                    npm run build -- --configuration production
                """
            }
        }

        stage('Deploy to Web Directory') {
            steps {
                echo '🚀 Deploying build to /var/www/html/saas-product ...'
                sh """
                    sudo rm -rf ${DEPLOY_PATH}/*
                    BUILD_DIR=$(find ${APP_ROOT}/saas-frontend/dist -type d -name '*' -exec test -f {}/index.html \\; -print | head -n 1)
                    echo "✅ Build directory detected: $BUILD_DIR"
                    sudo cp -r $BUILD_DIR/* ${DEPLOY_PATH}/
                    sudo chown -R www-data:www-data ${DEPLOY_PATH}
                    sudo chmod -R 755 ${DEPLOY_PATH}
                """
            }
        }
    }

    post {
        success {
            echo '✅ Build and deployment completed successfully! Your app is now live.'
        }
        failure {
            echo '❌ Build or deployment failed. Please check Jenkins logs for details.'
        }
    }
}

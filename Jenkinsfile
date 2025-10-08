pipeline {
    agent any
    options {
        disableConcurrentBuilds()
        skipDefaultCheckout()
    }

    environment {
        APP_ROOT = '/var/lib/jenkins/saas-user'
        DEPLOY_PATH = '/var/www/html/saas-product'
        PATH = "/var/lib/jenkins/.nvm/versions/node/v20.18.0/bin:${env.PATH}"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Source') {
            steps {
                script {
                    echo "🔹 Checking out latest code from Bitbucket..."
                    sh "rm -rf ${APP_ROOT} || true"
                    sh "mkdir -p ${APP_ROOT}"
                    dir("${APP_ROOT}") {
                        git branch: 'main',
                            credentialsId: 'Bitbucket',
                            url: 'https://bitbucket.org/unison-crm/saas-user.git',
                            changelog: false,
                            poll: true
                    }
                }
            }
        }

        stage('Setup Node.js') {
            steps {
                script {
                    echo "🔹 Ensuring Node.js 20.x is installed..."
                    sh '''
                        if ! command -v node >/dev/null 2>&1; then
                            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                            sudo apt-get install -y nodejs
                        fi
                        node -v
                        npm -v
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo "🔹 Cleaning and installing dependencies..."
                    sh """
                        cd ${APP_ROOT}
                        rm -rf node_modules package-lock.json || true
                        npm cache clean --force
                        npm install --force --legacy-peer-deps --no-audit --no-fund
                    """
                }
            }
        }

        stage('Build Angular App') {
            steps {
                script {
                    echo "🔹 Building Angular app for production..."
                    sh """
                        cd ${APP_ROOT}
                        npm run build --if-present || ng build --configuration production
                    """
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo "🔹 Deploying to ${DEPLOY_PATH}..."
                    sh """
                        sudo rm -rf ${DEPLOY_PATH}/*
                        sudo mkdir -p ${DEPLOY_PATH}

                        if [ -d "${APP_ROOT}/dist/browser" ]; then
                            sudo cp -r ${APP_ROOT}/dist/browser/* ${DEPLOY_PATH}/
                        elif [ -d "${APP_ROOT}/dist/saas-user/browser" ]; then
                            sudo cp -r ${APP_ROOT}/dist/saas-user/browser/* ${DEPLOY_PATH}/
                        elif [ -d "${APP_ROOT}/browser" ]; then
                            sudo cp -r ${APP_ROOT}/browser/* ${DEPLOY_PATH}/
                        else
                            echo "❌ No valid dist folder found!"
                            exit 1
                        fi

                        sudo chown -R www-data:www-data ${DEPLOY_PATH}
                        sudo chmod -R 755 ${DEPLOY_PATH}
                        echo "✅ Deployment completed successfully!"
                        ls -la ${DEPLOY_PATH}
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build and deployment successful!'
        }
        failure {
            echo '❌ Build or deployment failed. Check Jenkins logs for details.'
        }
    }
}

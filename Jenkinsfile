pipeline {
    agent any

    environment {
        DEPLOY_PATH = '/var/www/html/saas-product'
        WORK_DIR = '/var/lib/jenkins/saas-user'
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
                    sh "rm -rf ${WORK_DIR}"
                    sh "mkdir -p ${WORK_DIR}"
                    dir("${WORK_DIR}") {
                        git branch: 'main', credentialsId: 'Bitbucket', url: 'https://bitbucket.org/unison-crm/saas-user.git'
                    }
                }
            }
        }

        stage('Setup Node.js') {
            steps {
                script {
                    echo "🔹 Checking Node.js and npm versions..."
                    sh '''
                    node -v
                    npm -v
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo "🔹 Installing dependencies..."
                    sh """
                    cd ${WORK_DIR}
                    rm -rf node_modules package-lock.json
                    npm cache clean --force || true
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
                    cd ${WORK_DIR}
                    npm run build --if-present || ng build --configuration production
                    """
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo "🔹 Deploying build to ${DEPLOY_PATH}..."
                    sh """
                    sudo rm -rf ${DEPLOY_PATH}/*
                    sudo mkdir -p ${DEPLOY_PATH}

                    # Handle Angular output (newer Angular uses dist/<appname>/browser)
                    if [ -d "${WORK_DIR}/dist/saas-product/browser" ]; then
                        sudo cp -r ${WORK_DIR}/dist/saas-product/browser ${DEPLOY_PATH}/
                        sudo cp ${WORK_DIR}/dist/saas-product/3rdpartylicenses.txt ${DEPLOY_PATH}/
                        sudo cp ${WORK_DIR}/dist/saas-product/prerendered-routes.json ${DEPLOY_PATH}/
                    elif [ -d "${WORK_DIR}/dist/browser" ]; then
                        sudo cp -r ${WORK_DIR}/dist/browser ${DEPLOY_PATH}/
                        sudo cp ${WORK_DIR}/dist/3rdpartylicenses.txt ${DEPLOY_PATH}/
                        sudo cp ${WORK_DIR}/dist/prerendered-routes.json ${DEPLOY_PATH}/
                    else
                        echo "❌ No valid dist folder found!"
                        exit 1
                    fi

                    echo "✅ Deployment complete! Files in ${DEPLOY_PATH}:"
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
            echo '❌ Build or deployment failed! Check Jenkins logs for details.'
        }
    }
}

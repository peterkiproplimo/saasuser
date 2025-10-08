pipeline {
    agent any

    environment {
        DEPLOY_SERVER = 'techsavanna@vmi2792067'
        DEPLOY_PATH = '/var/www/html/saas-product'
        SSH_KEY_ID = 'bitbucket-ssh-key' // name of Jenkins SSH key credentials
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo "🔹 Checking out source code from Bitbucket..."
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://bitbucket.org/unison-crm/saas-user.git',
                        credentialsId: 'Bitbucket'
                    ]]
                ])
            }
        }

        stage('Setup Node.js') {
            steps {
                echo "🔹 Setting up Node.js 20..."
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
                echo "🔹 Installing dependencies (forced clean install)..."
                sh '''
                    npm cache clean --force
                    rm -rf node_modules package-lock.json
                    npm install --force --legacy-peer-deps --no-audit --no-fund
                '''
            }
        }

        stage('Build Angular App') {
            steps {
                echo "🔹 Building Angular project for production..."
                sh '''
                    npm run build -- --configuration production
                '''
            }
        }

        stage('Deploy to Server') {
            steps {
                echo "🔹 Deploying build to remote server..."
                script {
                    // Find Angular dist folder dynamically
                    def buildDir = sh(
                        script: "find dist -type d -name '*' -exec test -f {}/index.html \\; -print | head -n 1",
                        returnStdout: true
                    ).trim()

                    if (!buildDir) {
                        error "❌ No Angular build output found in dist/!"
                    }

                    echo "✅ Build directory detected: ${buildDir}"

                    // Deploy build to server
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_SERVER} 'sudo rm -rf ${DEPLOY_PATH}/*'
                        scp -r ${buildDir}/* ${DEPLOY_SERVER}:${DEPLOY_PATH}/
                        ssh ${DEPLOY_SERVER} 'sudo chown -R www-data:www-data ${DEPLOY_PATH} && sudo chmod -R 755 ${DEPLOY_PATH}'
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful! The app is now live on ${DEPLOY_SERVER}:${DEPLOY_PATH}"
        }
        failure {
            echo "❌ Build or deployment failed. Please check the Jenkins logs for details."
        }
    }
}

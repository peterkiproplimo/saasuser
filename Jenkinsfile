pipeline {
    agent any

    environment {
        // Customize if you deploy somewhere specific
        NODE_VERSION = '20'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                checkout scm
            }
        }

        stage('Install Node') {
            steps {
                echo "Setting up Node.js ${NODE_VERSION}"
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
                echo 'Installing npm dependencies...'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo 'Building Angular app...'
                sh 'npm run build --prod'
            }
        }

        stage('Archive Build') {
            steps {
                echo 'Archiving dist folder...'
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }

        stage('Deploy (optional)') {
            when {
                expression { return env.DEPLOY == 'true' }
            }
            steps {
                echo 'Deploying application...'
                // Example deploy step, replace with your actual method:
                // sh 'scp -r dist/* user@your-server:/var/www/html/'
            }
        }
    }

    post {
        success {
            echo '✅ Build completed successfully!'
        }
        failure {
            echo '❌ Build failed.'
        }
    }
}

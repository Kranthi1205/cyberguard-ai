pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_PATH = 'cyberguard'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Run npm install inside a temporary node:20 container
                sh 'docker run --rm -v $(pwd):/app -w /app/cyberguard/backend node:20 npm install'
                sh 'docker run --rm -v $(pwd):/app -w /app/cyberguard/frontend node:20 npm install'
            }
        }

        stage('Docker Build & Deploy') {
            steps {
                dir("${DOCKER_COMPOSE_PATH}") {
                    echo 'Building and starting containers...'
                    sh 'docker-compose down'
                    sh 'docker-compose up --build -d'
                }
            }
        }
    }

    post {
        success {
            echo '🛡️ CyberGuard AI Deployed Successfully!'
        }
        failure {
            echo '❌ Deployment Failed. Check the logs.'
        }
    }
}

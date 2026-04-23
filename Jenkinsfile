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

        stage('Docker Build & Deploy') {
            steps {
                dir("${DOCKER_COMPOSE_PATH}") {
                    echo 'Building and starting containers...'
                    // We let Docker-compose handle the npm install inside the image
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

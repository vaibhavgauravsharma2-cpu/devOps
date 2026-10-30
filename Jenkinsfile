pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        ansiColor('xterm')
    }

    parameters {
        string(name: 'DOCKERHUB_USERNAME', defaultValue: 'vaibhavsharma', description: 'Docker Hub username/namespace for publishing images')
        string(name: 'DOCKERHUB_CREDENTIALS_ID', defaultValue: 'dockerhub-credentials', description: 'Jenkins Credentials ID for Docker Hub (Username with Password / Token)')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Execute automated unit tests during build')
        booleanParam(name: 'PUSH_TO_REGISTRY', defaultValue: true, description: 'Push Docker images to Docker Hub registry')
        booleanParam(name: 'DEPLOY_LOCAL', defaultValue: true, description: 'Deploy application containers via Docker Compose')
    }

    environment {
        PROJECT_NAME   = 'mern-ecommerce'
        DOCKER_REGISTRY = "${params.DOCKERHUB_USERNAME}"
        SERVER_IMAGE   = "${params.DOCKERHUB_USERNAME}/mern-server"
        CLIENT_IMAGE   = "${params.DOCKERHUB_USERNAME}/mern-client"
        IMAGE_TAG      = "${BUILD_NUMBER}-${GIT_COMMIT ? GIT_COMMIT.take(7) : 'manual'}"
        NODE_OPTIONS   = '--openssl-legacy-provider'
    }

    stages {
        // ========================================================
        // Stage 1: Checkout Source Code
        // ========================================================
        stage('Checkout') {
            steps {
                echo "=========================================================="
                echo " Stage 1: Checkout Source Code"
                echo " Git Branch: ${env.GIT_BRANCH ?: 'main'}"
                echo " Git Commit: ${env.GIT_COMMIT ?: 'HEAD'}"
                echo " Build Tag : ${env.IMAGE_TAG}"
                echo "=========================================================="
                checkout scm
            }
        }

        // ========================================================
        // Stage 2: Dependency Installation
        // ========================================================
        stage('Dependency Installation') {
            steps {
                echo "=========================================================="
                echo " Stage 2: Installing Dependencies"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh '''
                            echo "Installing root dependencies..."
                            npm install --ignore-scripts
                            echo "Installing backend server dependencies..."
                            cd server && npm install --legacy-peer-deps
                            echo "Installing frontend client dependencies..."
                            cd ../client && npm install --legacy-peer-deps
                        '''
                    } else {
                        bat '''
                            echo Installing root dependencies...
                            call npm install --ignore-scripts
                            echo Installing backend server dependencies...
                            cd server && call npm install --legacy-peer-deps
                            echo Installing frontend client dependencies...
                            cd ..\\client && call npm install --legacy-peer-deps
                        '''
                    }
                }
            }
        }

        // ========================================================
        // Stage 3: Build Application
        // ========================================================
        stage('Build') {
            steps {
                echo "=========================================================="
                echo " Stage 3: Compiling Frontend Client Assets"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh '''
                            cd client
                            export NODE_OPTIONS=--openssl-legacy-provider
                            npm run build
                        '''
                    } else {
                        bat '''
                            cd client
                            set NODE_OPTIONS=--openssl-legacy-provider
                            call npm run build
                        '''
                    }
                }
            }
        }

        // ========================================================
        // Stage 4: Automated Testing
        // ========================================================
        stage('Test') {
            when {
                expression { return params.RUN_TESTS }
            }
            steps {
                echo "=========================================================="
                echo " Stage 4: Executing Automated Test Suite"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'npm test'
                    } else {
                        bat 'call npm test'
                    }
                }
            }
        }

        // ========================================================
        // Stage 5: Code Quality & Static Analysis
        // ========================================================
        stage('Code Quality') {
            steps {
                echo "=========================================================="
                echo " Stage 5: Code Quality and Syntax Verification"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'npm run lint'
                    } else {
                        bat 'call npm run lint'
                    }
                }
            }
        }

        // ========================================================
        // Stage 6: Docker Image Build
        // ========================================================
        stage('Docker Build') {
            steps {
                echo "=========================================================="
                echo " Stage 6: Building Multi-Platform Docker Images"
                echo " Target Tag: ${env.IMAGE_TAG} and latest"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh """
                            echo "Building Server Image..."
                            docker build -t ${env.SERVER_IMAGE}:${env.IMAGE_TAG} -t ${env.SERVER_IMAGE}:latest ./server
                            echo "Building Client Image..."
                            docker build --build-arg API_URL=http://localhost:3000/api -t ${env.CLIENT_IMAGE}:${env.IMAGE_TAG} -t ${env.CLIENT_IMAGE}:latest ./client
                        """
                    } else {
                        bat """
                            echo Building Server Image...
                            docker build -t ${env.SERVER_IMAGE}:${env.IMAGE_TAG} -t ${env.SERVER_IMAGE}:latest ./server
                            echo Building Client Image...
                            docker build --build-arg API_URL=http://localhost:3000/api -t ${env.CLIENT_IMAGE}:${env.IMAGE_TAG} -t ${env.CLIENT_IMAGE}:latest ./client
                        """
                    }
                }
            }
        }

        // ========================================================
        // Stage 7: Docker Image Validation
        // ========================================================
        stage('Docker Validation') {
            steps {
                echo "=========================================================="
                echo " Stage 7: Validating Docker Image Configurations"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh """
                            echo "Inspecting server image..."
                            docker image inspect ${env.SERVER_IMAGE}:${env.IMAGE_TAG} > /dev/null
                            echo "Inspecting client image..."
                            docker image inspect ${env.CLIENT_IMAGE}:${env.IMAGE_TAG} > /dev/null
                            echo "Validating docker-compose configuration..."
                            docker compose config --quiet || docker-compose config -q
                        """
                    } else {
                        bat """
                            echo Inspecting server image...
                            docker image inspect ${env.SERVER_IMAGE}:${env.IMAGE_TAG} > nul
                            echo Inspecting client image...
                            docker image inspect ${env.CLIENT_IMAGE}:${env.IMAGE_TAG} > nul
                            echo Validating docker-compose configuration...
                            docker compose config -q
                        """
                    }
                }
            }
        }

        // ========================================================
        // Stage 8: Docker Registry Login
        // ========================================================
        stage('Docker Registry Login') {
            when {
                expression { return params.PUSH_TO_REGISTRY }
            }
            steps {
                echo "=========================================================="
                echo " Stage 8: Authenticating with Docker Hub"
                echo "=========================================================="
                script {
                    withCredentials([usernamePassword(
                        credentialsId: params.DOCKERHUB_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        if (isUnix()) {
                            sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        } else {
                            bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                        }
                    }
                }
            }
        }

        // ========================================================
        // Stage 9: Docker Push
        // ========================================================
        stage('Docker Push') {
            when {
                expression { return params.PUSH_TO_REGISTRY }
            }
            steps {
                echo "=========================================================="
                echo " Stage 9: Pushing Images to Docker Hub Registry"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh """
                            docker push ${env.SERVER_IMAGE}:${env.IMAGE_TAG}
                            docker push ${env.SERVER_IMAGE}:latest
                            docker push ${env.CLIENT_IMAGE}:${env.IMAGE_TAG}
                            docker push ${env.CLIENT_IMAGE}:latest
                        """
                    } else {
                        bat """
                            docker push ${env.SERVER_IMAGE}:${env.IMAGE_TAG}
                            docker push ${env.SERVER_IMAGE}:latest
                            docker push ${env.CLIENT_IMAGE}:${env.IMAGE_TAG}
                            docker push ${env.CLIENT_IMAGE}:latest
                        """
                    }
                }
            }
        }

        // ========================================================
        // Stage 10: Deployment (Docker Compose)
        // ========================================================
        stage('Deployment') {
            when {
                expression { return params.DEPLOY_LOCAL }
            }
            steps {
                echo "=========================================================="
                echo " Stage 10: Deploying Containers via Docker Compose"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh """
                            export DOCKER_REGISTRY=${params.DOCKERHUB_USERNAME}
                            export IMAGE_TAG=${env.IMAGE_TAG}
                            docker compose down --remove-orphans || docker-compose down --remove-orphans || true
                            docker compose up -d || docker-compose up -d
                        """
                    } else {
                        bat """
                            set DOCKER_REGISTRY=${params.DOCKERHUB_USERNAME}
                            set IMAGE_TAG=${env.IMAGE_TAG}
                            docker compose down --remove-orphans
                            docker compose up -d
                        """
                    }
                }
            }
        }
    }

    // ============================================================
    // Post-Build Actions
    // ============================================================
    post {
        always {
            echo "=========================================================="
            echo " Post-Build: Cleaning up temporary resources"
            echo "=========================================================="
            cleanWs deleteDirs: true, notFailBuild: true
        }
        success {
            echo "=========================================================="
            echo " SUCCESS: CI/CD Pipeline Completed Successfully!         "
            echo " Application deployed and accessible at:                  "
            echo "   - Frontend UI:  http://localhost:8080                  "
            echo "   - Backend API:  http://localhost:3000                  "
            echo "   - Docker Image: ${env.SERVER_IMAGE}:${env.IMAGE_TAG}   "
            echo "   - Docker Image: ${env.CLIENT_IMAGE}:${env.IMAGE_TAG}   "
            echo "=========================================================="
        }
        failure {
            echo "=========================================================="
            echo " FAILURE: CI/CD Pipeline Failed.                          "
            echo " Please review stage logs above for diagnostic details.   "
            echo "=========================================================="
        }
    }
}

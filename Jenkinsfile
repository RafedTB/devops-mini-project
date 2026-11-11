pipeline {
    agent any
    
    tools {
        // Must match the tool name in Manage Jenkins > Tools > NodeJS Installations
        nodejs 'NodeJS24'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }
        
        stage('Quality & Linting') {
            steps {
                // Backend ESLint
                sh 'npm run lint || true'
                // Frontend TypeScript verification
                dir('frontend') {
                    sh 'npm run lint || true'
                }
            }
        }
        
        stage('Testing') {
            steps {
                // --runInBand prevents Jenkins workers from running out of memory
                sh 'npx jest --runInBand'
            }
        }
        
        stage('Build Backend (NestJS)') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Build Frontend (React Vite)') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**, frontend/dist/**', allowEmptyArchive: false
            }
        }
        
        stage('Deploy Application') {
            steps {
                // Jenkins will now launch your containers automatically!
                sh 'docker compose up -d --build'
            }
        }
    }
    
    post {
        failure {
            echo 'Pipeline failed! Check the stage logs above.'
        }
        success {
            echo 'Build, tests, and packaging completed successfully!'
        }
    }
}

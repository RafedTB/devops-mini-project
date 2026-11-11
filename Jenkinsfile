pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS24' 
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Quality & Linting') {
            steps {
                sh 'npm ci'
                sh 'npm run lint'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run lint'
                }
            }
        }
        
        stage('Testing') {
            steps {
                sh 'npm run test'
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
    }
}
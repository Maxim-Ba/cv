pipeline {
  agent any

  environment {
    IMAGE = "3224142123/cv-frontend"
    DEPLOY = "cv-frontend"
    NS = "cv-portfolio"
  }

  stages {
    stage('Build') {
      steps {
        script {
          docker.build("${IMAGE}:${GIT_COMMIT}")
        }
      }
    }

    stage('Push') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
            docker.image("${IMAGE}:${GIT_COMMIT}").push()
            docker.image("${IMAGE}:${GIT_COMMIT}").push('latest')
          }
        }
      }
    }

    stage('Deploy') {
      steps {
        withKubeConfig([credentialsId: 'kubeconfig']) {
          sh """
            kubectl set image deployment/${DEPLOY} \
              ${DEPLOY}=${IMAGE}:${GIT_COMMIT} \
              -n ${NS}
            kubectl rollout status deployment/${DEPLOY} -n ${NS}
          """
        }
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed!'
    }
  }
}

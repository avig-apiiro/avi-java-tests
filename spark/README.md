# spark
[![Build Status](https://travis-ci.org/juliaaano/spark.svg)](https://travis-ci.org/juliaaano/spark)
[![Release](https://img.shields.io/github/release/juliaaano/spark.svg)](https://github.com/juliaaano/spark/releases/latest)
[![Maven Central](https://img.shields.io/maven-central/v/com.apiiro.avigtest/spark.svg)](https://maven-badges.herokuapp.com/maven-central/com.apiiro.avigtest/spark)
[![Javadocs](http://www.javadoc.io/badge/com.apiiro.avigtest/spark.svg?color=blue)](http://www.javadoc.io/doc/com.apiiro.avigtest/spark)

A quick start for the development of new Java applications. :ok_hand:

* Container-ready with **Docker** and Docker Compose configuration.
* Docker **builder** pattern with caching of Maven dependencies.
* Red Hat **OpenShift** container deployment.
* Basic **Kubernetes** deployment and service definitions.
* **Istio** ingress gateway and virtual service definitions.
* **Travis** CI pipeline with automated GitHub releases and Docker build and push.
* **Spark Java's** smart and simple http endpoints.
* Testing with **REST-assured**.
* SLF4J and Logback setup, with per-request log level filter.
* Additional **Log4j2** YAML config with several features.
* Prints ascii banner at application startup.

## Docker
```
docker-compose up
curl -i http://localhost:8000/status
curl -i -X POST http://localhost:8000/api/greeting -d '{"name": "John", "surname":"Smith"}' -H "Content-Type: application/json"
curl -i -X POST http://localhost:8000/api/greeting -d '{"name": "John", "surname":"Smith"}' -H "Content-Type: application/json" -H "X-Request-ID: myCorrelationID" -H "X-Log-Level: DEBUG"
```

## Kubernetes
```
minikube start
eval $(minikube docker-env)
docker build -t juliaaano/spark:1.0-SNAPSHOT .
kubectl create namespace my-namespace
kubectl config set-context --current --namespace=my-namespace
kubectl apply -f manifests/
kubectl set image deployment spark app=juliaaano/spark:1.0-SNAPSHOT
kubectl scale deployment spark --replicas 2
kubectl expose deployment spark --name=spark-lb --type=LoadBalancer --port=8000 --target-port=4567
minikube tunnel
curl "http://localhost:8000/api/hostname"
```

## OpenShift

Login to an existing cluster.

### Build the app with Maven:
```
mvn clean package -DskipTests
```

### Setup the project/namespace:
```
oc new-project my-project
oc create secret docker-registry my-redhat-credentials \
    --docker-server=registry.redhat.io \
    --docker-username=my-redhat-username \
    --docker-password=my-redhat-password
oc secrets link default my-redhat-credentials --for=pull
oc secrets link builder my-redhat-credentials
```

### Build container image:
```
oc new-build --binary=true --docker-image=registry.redhat.io/ubi8/openjdk-11 --name=spark
oc start-build spark --from-file ./target/app-1.0-SNAPSHOT.jar --follow
```

### Deployment
```
oc apply -f manifests/
oc set image deployment spark app=$(oc get imagestream spark -o jsonpath='{.status.dockerImageRepository}')
oc scale deployment spark --replicas 3
oc expose service spark
curl "http://$(oc get route spark -o jsonpath='{.spec.host}')/api/hostname"
```

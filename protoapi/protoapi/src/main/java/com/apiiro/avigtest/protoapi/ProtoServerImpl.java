package com.apiiro.avigtest.protoapi;

import io.grpc.stub.StreamObserver;

public class ProtoServerImpl extends ProtoServerGrpc.ProtoServerImplBase{

        @Override
        public void getPerson(PersonRequest req, StreamObserver<Person> responseObserver) {
            Person reply = Person.newBuilder().setName(req.getName()).build();
            responseObserver.onNext(reply);
            responseObserver.onCompleted();
        }
}




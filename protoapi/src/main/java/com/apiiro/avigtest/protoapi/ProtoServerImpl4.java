package com.apiiro.avigtest.protoapi;

import io.grpc.stub.StreamObserver;
import protoapi.HelloWorld;
import protoapi.ProtoServer4Grpc;

public class ProtoServerImpl4 extends ProtoServer4Grpc.ProtoServer4ImplBase {

    @Override
    public void getFullPerson(HelloWorld.PersonRequest4 request, StreamObserver<HelloWorld.Person4> responseObserver) {
        responseObserver.onNext(buildPerson(request.getName(),"email", "1234"));
    }

    @Override
    public void getPerson(HelloWorld.PersonRequest4 request, StreamObserver<HelloWorld.Person4> responseObserver) {
        String email = request.getName() + "@email.com";
        HelloWorld.Person4 reply = buildPerson(request.getName(), email, "1234");
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }

    public HelloWorld.Person4 buildPerson(String name, String email, String creditCard) {
        return HelloWorld.Person4.newBuilder()
            .setName(name)
            .setEmail(email)
            .setUsername(name)
            .setCreditCardNumber(creditCard)
            .build();
    }
}

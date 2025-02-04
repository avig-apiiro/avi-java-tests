package com.apiiro.avigtest.protoapi;

import io.grpc.stub.StreamObserver;
import protoapi.Person3;
import protoapi.PersonRequest3;
import protoapi.ProtoServer3Grpc;


public class ProtoServerImpl3 extends ProtoServer3Grpc.ProtoServer3ImplBase {


    @Override
    public void getPerson(PersonRequest3 request, StreamObserver<Person3> responseObserver) {
        super.getPerson(request, responseObserver);
    }

    @Override
    public void getFullPerson(PersonRequest3 request, StreamObserver<Person3> responseObserver) {
        String email = request.getName() + "@email.com";
        Person3 reply = buildPerson(request.getName(), email, "1234");
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }

    public Person3 buildPerson(String name, String email, String creditCard) {
        return Person3.newBuilder()
            .setName(name)
            .setEmail(email)
            .setUsername(name)
            .setCreditCardNumber(creditCard)
            .build();
    }
}

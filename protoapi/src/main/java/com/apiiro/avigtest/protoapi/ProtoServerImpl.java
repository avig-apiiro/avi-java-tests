package com.apiiro.avigtest.protoapi;

import io.grpc.stub.StreamObserver;

public class ProtoServerImpl extends ProtoServerSNGrpc.ProtoServerSNImplBase{
    @Override
    public void getPerson(PersonRequest request, StreamObserver<Person> responseObserver) {
        super.getPerson(request, responseObserver);
    }

    public Person buildPerson(String name, String email, String creditCard)
    {
        return Person.newBuilder()
            .setName(name)
            .setEmail(email)
            .setUsername(name)
            .setCreditCardNumber(creditCard)
            .build();
    }
    @Override
    public void getFullPerson(PersonRequest request, StreamObserver<Person> responseObserver) {
        String email = getFullPerson(request.getName());
        Person reply = buildPerson(request.getName(), email, "1234");
            responseObserver.onNext(reply);
            responseObserver.onCompleted();
    }

    private String getFullPerson(String name) {
        return "wazzaaaa";
    }
// with outer class name and multiple=false
//    @Override
//    public void getPerson(HelloWorldProto.PersonRequest request, StreamObserver<HelloWorldProto.Person> responseObserver) {
//        super.getPerson(request, responseObserver);
//    }

// no outer class name
    //    @Override
//    public void getPerson(Server.PersonRequest request, StreamObserver<Server.Person> responseObserver) {
//        super.getPerson(request, responseObserver);
//    }

//        @Override
//        public void getPerson(HelloWorldProto.PersonRequest req, StreamObserver<HelloWorldProto.Person> responseObserver) {
//            HelloWorldProto.Person reply = HelloWorldProto.Person.newBuilder().setName(req.getName()).build();
//            responseObserver.onNext(reply);
//            responseObserver.onCompleted();
//        }


}




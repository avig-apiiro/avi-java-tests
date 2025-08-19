package com.apiiro.avigtest.springdemo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
public class AnotherUserManager {

    public AnotherUser getUser(String name) {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("com.apiiro.avigtest.springdemo");
        EntityManager em = emf.createEntityManager();

        // --- Store a new user ---
        em.getTransaction().begin();
        AnotherUser user = new AnotherUser(name.hashCode(), name, "user"+name, "1249", name+"@email.com");
        em.persist(user);
        em.getTransaction().commit();

        System.out.println("Saved User ID = " + user.getId());

        // --- Read it back ---
        AnotherUser found = em.find(AnotherUser.class, user.getId());
        System.out.println("Found User: " + found.getName());

        em.close();
        emf.close();
        return user;
    }
}

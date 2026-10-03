package com.apiiro.avigtest.sast;

/**
 * Semgrep: java.lang.security.audit.unsafe-reflection
 * User-controlled class name passed to Class.forName or reflection.
 */
public class ReflectionInjectionExample {

    // semgrep: unsafe reflection - user-controlled className used in Class.forName
    public Object loadClass(String className) throws Exception {
        Class<?> clazz = Class.forName(className);
        return clazz.getDeclaredConstructor().newInstance();
    }

    // semgrep: unsafe reflection - user-controlled method name invoked via reflection
    public Object invokeMethod(Object target, String methodName) throws Exception {
        return target.getClass().getMethod(methodName).invoke(target);
    }
}

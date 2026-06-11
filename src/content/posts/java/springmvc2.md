---
title: Spring mvc配置消息转换器
published: 2024-09-30 16:37:43
pinned: false
description: 配置消息转换器 配置FastJson转换器 选择一个配置文件类实现WebMvcConfigurer 重写configureMessageConverters方法注册添加消息转换器，...
tags:
- 动态
- 旧文件
- java
category: 文章示例
draft: false
image: ./images/firefly2.avif
---


## 配置消息转换器

#### 配置FastJson转换器

* 选择一个配置文件类实现WebMvcConfigurer

* 重写configureMessageConverters方法注册添加消息转换器，需要配置UTF-8格式。

  ```java
   public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
          FastJsonHttpMessageConverter converter = new FastJsonHttpMessageConverter();
  //        FastJsonConfig fastJsonConfig = new FastJsonConfig();
          List<MediaType> fastMediaTypes = new ArrayList<>();
          fastMediaTypes.add(MediaType.APPLICATION_JSON_UTF8);
          converter.setSupportedMediaTypes(fastMediaTypes);
          converters.add(converter);
      }
      @Autowired
      public SpringMvcConfig(UserController u){
  
      }
  ```

#### 钩子方法

父类定义一个模版方法，即方法中没有内容，但是有参数，子类重写方法，此时使用多态赋值父类，父类调用钩子方法，通过方法参数就能钓到子类运行后的值，本质就是地址里的值改变了，地址其实没有变，钩子里有个小参数诱饵但是经过执行后，钓到了大的鱼，即将其附上了其他值。对于spirng中就是容器实例化的自动注入，实现多态，然后钩子调用。

* 父类，但是方法上加了@Bean 此时如果IOC容器中有子类实例，则会多态自动注入到this中， 通过System.out.println(this);以及通过一个Controller类自动注入实现类，然后输出地址，你会发现其实是一个地址，也就是此时this其实就是其容器里注册后子类实例，然后spirng启动后会扫描执行该方法，此时容器是没有该类实例，只有实现类实例。

```java
public  class Student {
    private String name;
    private int age;

    @Bean
    public void beanTest(){
        List<Integer>ss =new ArrayList<>() ;
        this.hook(ss);
        //ss相对于鱼饵
        System.out.println(this);
        //此时ss变成了大鱼，因为里面有东西了。
        System.out.println("勾中了"+ss.toString());

    }

	//钩子方法
    public void hook(List<Integer> s){
        System.out.println(name);
    }
    //有参构造
    public Student(String name, int age){
        this.name = name;
        this.age = age;
    }



    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

* 子类，类上加了Componet注解，告诉容器要创建实例，然后重写了钩子方法，同时s加上了1。

  ```java
  @Component
  public class MyTest extends Student {
      private String name;
      private int age;
  
      public MyTest() {
          super("123",10);
          this.name ="ssss";
          this.age =30;
      }
  
      @Override
      public void hook(List<Integer> s) {
          s.add(1);
          System.out.println("重写了");
      }
  
  }
  ```

* 输出结果

  ![image-20240930154947457](https://cdn.jsdelivr.net/gh/hongjinlv/img_repo/hongying/202409301549550.png)

  而此时的自动注入的输出为：（具体代码不放了，应该都会）

  ![image-20240930155027186](https://cdn.jsdelivr.net/gh/hongjinlv/img_repo/hongying/202409301550229.png)

  可以发现实现了钩子功能，钓上了1。这就是钩子方法，其实原理就是多态然后方法内值改了，不过记住前提地址不能变，否则达不到效果，因为spring的注解+IOC容器原理，所以我们会理解不了。

#### @EnableWebMvc注解

1. 进入发现@Import 了DelegatingWebMvcConfiguration 类 。

2. 进入 发现 有个@Autowired 修饰的方法setConfigurers()方法，同时 WebMvcConfigureComposite类实例  --addWebMvcConfigurers（）--> 所有继承WebMvcConfigurer的类（方法上使用@Autowired注解，参数自动注入）

3. 进入WebMvcConfigureComposite类：List<WebMvcConfigurer> delegates  将所有所有继承WebMvcConfigurer的类添加。

4. 在看DelegatingWebMvcConfiguration 类继承了WebMvcConfigurationSupport 这个类中有个@Bean注解的方法如下

   ```java
   @Bean
   public RequestMappingHandlerAdapter requestMappingHandlerAdapter(@Qualifier("mvcContentNegotiationManager") ContentNegotiationManager contentNegotiationManager, @Qualifier("mvcConversionService") FormattingConversionService conversionService, @Qualifier("mvcValidator") Validator validator) {
       RequestMappingHandlerAdapter adapter = this.createRequestMappingHandlerAdapter();
       adapter.setContentNegotiationManager(contentNegotiationManager);
       //重点关注的函数
       adapter.setMessageConverters(this.getMessageConverters());
       
       adapter.setWebBindingInitializer(this.getConfigurableWebBindingInitializer(conversionService, validator));
       adapter.setCustomArgumentResolvers(this.getArgumentResolvers());
       adapter.setCustomReturnValueHandlers(this.getReturnValueHandlers());
       if (jackson2Present) {
           adapter.setRequestBodyAdvice(Collections.singletonList(new JsonViewRequestBodyAdvice()));
           adapter.setResponseBodyAdvice(Collections.singletonList(new JsonViewResponseBodyAdvice()));
       }
   
       AsyncSupportConfigurer configurer = this.getAsyncSupportConfigurer();
       if (configurer.getTaskExecutor() != null) {
           adapter.setTaskExecutor(configurer.getTaskExecutor());
       }
   
       if (configurer.getTimeout() != null) {
           adapter.setAsyncRequestTimeout(configurer.getTimeout());
       }
   
       adapter.setCallableInterceptors(configurer.getCallableInterceptors());
       adapter.setDeferredResultInterceptors(configurer.getDeferredResultInterceptors());
       return adapter;
   }
   ```

​	上面标记的函数为关键函数，进入this.getMessageConverters()函数中看。

```java
protected final List<HttpMessageConverter<?>> getMessageConverters() {
    if (this.messageConverters == null) {
        this.messageConverters = new ArrayList();
        this.configureMessageConverters(this.messageConverters);
        if (this.messageConverters.isEmpty()) {
            this.addDefaultHttpMessageConverters(this.messageConverters);
        }

        this.extendMessageConverters(this.messageConverters);
    }

    return this.messageConverters;
}
```

​	发现this.configureMessageConverters(this.messageConverters);为钩子方法，其实这个就是消息转换器，肯定重点关注，然后ctrl+alt+左键进入子类DelegatingWebMvcConfiguration ，没错就是它，然后进去函数看。

```java
protected void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
    this.configurers.configureMessageConverters(converters);
}
```

这...，你发现这不就是有调用了WebMvcConfigureComposite实例去添加消息转换器，之前是把所有继承WebMvcConfigurer的类添加添加进去，现在是去调用configureMessageConverters把所有继承WebMvcConfigurer的类实例的configureMessageConverters调用..

```java
public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
    Iterator var2 = this.delegates.iterator();

    while(var2.hasNext()) {
        WebMvcConfigurer delegate = (WebMvcConfigurer)var2.next();
        delegate.configureMessageConverters(converters);
    }

}
```

5. 经过上述步骤终于将我们的方法调用了，从而加入了我们自定义的FastJson消息转换器。




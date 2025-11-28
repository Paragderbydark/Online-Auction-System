package com.GSA.Backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HomeController {

    @GetMapping("/")
    public String home(){
        return "This is auction home";
    }

    @GetMapping("/user")
    public String userGreeting(){
        return "This is user page";
    }

    @GetMapping("/admin")
    public String adminGreeting(){
        return "This is admin page";
    }
}
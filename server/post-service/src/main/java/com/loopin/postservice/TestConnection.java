package com.loopin.postservice;

import java.sql.Connection;
import java.sql.DriverManager;

public class TestConnection {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require&currentSchema=public";
        String user = "postgres.otwzntavizmovrohsfvy";
        String password = "mimi30july2014";

        System.out.println("Connecting as: " + user);
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("SUCCESS — connected to database: " + conn.getCatalog());
        }
    }
}
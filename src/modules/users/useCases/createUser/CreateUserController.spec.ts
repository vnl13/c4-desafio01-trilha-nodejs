import request from "supertest";
import { Connection, createConnection } from 'typeorm';
import {v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

import { app } from "../../../../app";

let connection: Connection;
let user: { name: string, email: string, password: string };

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    user = {
      name: "User Test",
      email: "create@mail.com",
      password: "password"
    }

    const id = uuid();
    const password = await hash("password", 8);
    await connection.query(`INSERT INTO USERS(id, name, email, password, created_at) values ('${id}', '${user.name}', '${user.email}', '${password}', 'now()')`);
  });

  afterAll(async () => {
    await connection.query(`DELETE FROM users WHERE email = '${user.email}'`);
    await connection.query(`DELETE FROM users WHERE email = 'create_test@mail.com'`);
    await connection.close();
  });

  it("should be able to create a new  user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "create_test@mail.com",
      password: "password"
    })
    expect(response.status).toBe(201);
  });

  it("should not be able to create a user if email was used", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "create_test@mail.com",
      password: "password"
    })

    expect(response.status).toBe(400);
    expect(JSON.parse(response.text)).toMatchObject({"message":"User already exists"});
  });

});
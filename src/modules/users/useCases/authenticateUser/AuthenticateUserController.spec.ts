import request from "supertest";
import { Connection, createConnection } from 'typeorm';
import {v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

import { app } from "../../../../app";

let connection: Connection;
let user: { name: string, email: string, password: string };

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    user = {
      name: "User Test",
      email: "authenticate@mail.com",
      password: "password"
    }

    const id = uuid();
    const password = await hash("password", 8);
    await connection.query(`INSERT INTO USERS(id, name, email, password, created_at) values ('${id}', '${user.name}', '${user.email}', '${password}', 'now()')`);
  });

  afterAll(async () => {
    await connection.query(`DELETE FROM users WHERE email = '${user.email}'`);
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    await request(app).post("/api/v1/users").send(user);
 
    const authenticate = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password
    });

    expect(authenticate.body).toHaveProperty("token");
    expect(authenticate.status).toBe(200);
  });

  it("should not be able to authenticate a user with wrong password", async () => {
    const authenticate = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: "wrong"
    });

    expect(authenticate.body).toMatchObject({message: "Incorrect email or password"});
    expect(authenticate.status).toBe(401);
  });

  it("should not be able to authenticate a non-existing user", async () => {
    const authenticate = await request(app).post("/api/v1/sessions").send({
      email: "null@mail.com",
      password: "wrong"
    });

    expect(authenticate.body).toMatchObject({message: "Incorrect email or password"});
    expect(authenticate.status).toBe(401);
  });

});
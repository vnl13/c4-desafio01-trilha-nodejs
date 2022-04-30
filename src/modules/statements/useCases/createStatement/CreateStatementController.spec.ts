import request from "supertest";
import { Connection, createConnection } from 'typeorm';
import {v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

import { app } from "../../../../app";

let connection: Connection;
let user: { name: string, email: string, password: string };

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    user = {
      name: "User Test",
      email: "create_statement@mail.com",
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
  

  it("should be able to create a deposit operation for user", async () => {
    const responseAuth =  await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    })

    const { token } = responseAuth.body;

    const depositOperation = await request(app).post("/api/v1/statements/deposit").send({
      amount: 200,
      description: "Deposit Test"
    }).set({"Authorization": `Bearer ${token}`});

    expect(depositOperation.body).toHaveProperty("id");
    expect(depositOperation.body).toHaveProperty("user_id");
    expect(depositOperation.status).toBe(201);
  });

  it("should be able to create a withdraw operation for user", async () => {
    const responseAuth =  await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    })

    const { token } = responseAuth.body;

    const withdrawOperation = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 50,
      description: "Withdraw Test"
    }).set({"Authorization": `Bearer ${token}`});

    expect(withdrawOperation.body).toHaveProperty("id");
    expect(withdrawOperation.body).toHaveProperty("user_id");
    expect(withdrawOperation.status).toBe(201);
  });

  it("should not be able to create a statement for a non-existing user", async () => {
    const responseAuth =  await request(app).post("/api/v1/sessions").send({
      email: "fake@mail.com",
      password: "password"
    })

    expect(responseAuth.body).toHaveProperty("message");
    expect(responseAuth.body).toMatchObject({message: "Incorrect email or password"});
    expect(responseAuth.status).toBe(401);
  });

  it("should not be able to create a statement for user with wrong password", async () => {
    const responseAuth =  await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: "wrong"
    })

    expect(responseAuth.body).toHaveProperty("message");
    expect(responseAuth.body).toMatchObject({message: "Incorrect email or password"});
    expect(responseAuth.status).toBe(401);
  });

  it("should not be able to create a withdraw operation if user has insufficient funds", async () => {
    const responseAuth =  await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password
    })

    const { token } = responseAuth.body;

    const withdrawOperation = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 500,
      description: "Withdraw Test"
    }).set({"Authorization": `Bearer ${token}`});

    expect(withdrawOperation.body).toHaveProperty("message");
    expect(withdrawOperation.body).toMatchObject({ message: 'Insufficient funds' });
    expect(withdrawOperation.status).toBe(400);
  });

});
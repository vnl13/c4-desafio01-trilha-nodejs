import request from "supertest";
import { Connection, createConnection } from 'typeorm';
import {v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

import { app } from "../../../../app";

let connection: Connection;
let user: { name: string, email: string, password: string };

describe(" Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    user = {
      name: "User Test",
      email: "get_operation@mail.com",
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

  it("should be able to get a users's statement operation", async () => {

    const responseAuth =  await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    })

    const { token } = responseAuth.body;

    const depositOperation = await request(app).post("/api/v1/statements/deposit").send({
      amount: 200,
      description: "Deposit Test"
    }).set({"Authorization": `Bearer ${token}`});

    const { id } = depositOperation.body;

    const getStatement = await request(app).get(`/api/v1/statements/${id}`).set({"Authorization": `Bearer ${token}`})

    expect(getStatement.body).toHaveProperty("user_id");
    expect(getStatement.body).toHaveProperty("type");
    expect(getStatement.status).toBe(200);

  });

  it("should not be able to get a users's statement operation with a invalid JWT", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NTA4MTU0MzUsImV4cCI6MTY1MDkwMTgzNSwic3ViIjoiNDlkMGNmODItY2UwNy00ZjQ0LTkxZDMtMGM0Nzc0NGQ5M2JlIn0.eukMg-JJO6kCO8smwTqo-bV2BM4sKBkX-163-IUP0wo";

    const responseAuth =  await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    })

    const { token } = responseAuth.body;

    const depositOperation = await request(app).post("/api/v1/statements/deposit").send({
      amount: 200,
      description: "Deposit Test"
    }).set({"Authorization": `Bearer ${token}`});

    const { id } = depositOperation.body;

    const getStatement = await request(app).get(`/api/v1/statements/${id}`).set({"Authorization": `Bearer ${fakeToken}`})

    expect(getStatement.body).toMatchObject({"message": "JWT invalid token!"});
    expect(getStatement.status).toBe(401);
  });

});
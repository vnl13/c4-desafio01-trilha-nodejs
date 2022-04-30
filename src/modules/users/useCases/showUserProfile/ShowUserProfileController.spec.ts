import request from "supertest";
import { Connection, createConnection } from 'typeorm';
import {v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

import { app } from "../../../../app";

let connection: Connection;
let user: { name: string, email: string, password: string };

describe("Show Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    user = {
      name: "User Test",
      email: "profile@mail.com",
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

  it("should be able to show a user's profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send(user);
    const { token } = responseToken.body;

    const profile = await request(app).get("/api/v1/profile").set({"Authorization": `Bearer ${token}`});

    expect(profile.status).toBe(200);
    expect(profile.body).toHaveProperty("created_at");
    expect(profile.body).toHaveProperty("name");
  });

  it("should not be able to show a profile without token", async () => {
    const token = "fakeToken";

    const profile = await request(app).get("/api/v1/profile").set({"Authorization": `Bearer ${token}`});

    expect(profile.status).toBe(401);
    expect(profile.body).toHaveProperty("message");
    expect(profile.body).toMatchObject({message: "JWT invalid token!"});
  });

});
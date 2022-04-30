import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUseUseCase: CreateUserUseCase;

describe("Authenticate User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUseUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate a user", async () => {
    const user = await createUseUseCase.execute({
      email: "test@test.com", 
      password: "123456",
      name: "Test"
    });

    const authenticate = await authenticateUserUseCase.execute({ email: user.email, password: "123456"});

    expect(authenticate).toHaveProperty("token");
    expect(authenticate).toHaveProperty("user");
  });

  it("should not be able to authenticate a non-existing user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({ email: "nonexisting@mail.com", password: "123456"});
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate a user with wrong password", async () => {
    expect( async() => {
      const user = await createUseUseCase.execute({
        email: "test@test.com", 
        password: "123456",
        name: "Test"
      });
      
      await authenticateUserUseCase.execute({ email: user.email, password: "654321"});
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

});
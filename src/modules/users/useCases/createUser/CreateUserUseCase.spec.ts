import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({name: "Test", email: "test@mail.com", password: "123456"});

    expect(user).toHaveProperty("id");
  })

  it("should not be able to create a user with existing email", () => {

    expect(async() => {
      await createUserUseCase.execute({name: "Test", email: "test@mail.com", password: "123456"});

      await createUserUseCase.execute({name: "Test2", email: "test@mail.com", password: "678912"});
    }).rejects.toBeInstanceOf(CreateUserError);

  });

});
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show User Profile", () => {

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to show a user profile", async () => {
    const user = await createUserUseCase.execute({email: "test@mail.com", name: "Test", password: "123456"});
    const profile = await showUserProfileUseCase.execute(user.id as string);

    expect(profile).toHaveProperty("id");
    expect(profile).toHaveProperty("name");
  });

  it("should not be able to show a non-existing user profile", async () => {
    expect(async() => {
      await showUserProfileUseCase.execute("123456");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });

});
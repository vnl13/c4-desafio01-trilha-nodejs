import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("should be able to get user's balance", async () => {

    const user = await createUserUseCase.execute({name: "Test", email: "test@mail.com", password: "123456"});

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 50,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });


    const balance = await getBalanceUseCase.execute({user_id: user.id as string});

    expect(balance.balance).toBe(150);
    expect(balance).toHaveProperty("statement");

  });

  it("should not be able to get balance for a non-existing user", () => {
    const fakeId = "c17a0c25-cdbc-47a8-8e4d-6b1d07f4e7dc";

    expect(async () => {
      await getBalanceUseCase.execute({user_id: fakeId});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
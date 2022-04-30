import { CreateStatementError } from "./CreateStatementError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { Statement } from "../../entities/Statement";
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a deposit operation for user statement", async () => {
    const user = await createUserUseCase.execute({name: "Test", email: "test@mail.com", password: "123456"});

    const depositOperation = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });

    expect(depositOperation).toBeInstanceOf(Statement);
    expect(depositOperation).toHaveProperty("id");
    expect(depositOperation.user_id).toBe(user.id);
  });

  it("should be able to create a withdraw operation for user statement", async () => {
    const user = await createUserUseCase.execute({name: "Test", email: "test@mail.com", password: "123456"});

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });

    const withdrawOperation = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 50,
      description: "Withdraw Test",
      type: OperationType.WITHDRAW,
    });

    expect(withdrawOperation).toBeInstanceOf(Statement);
    expect(withdrawOperation).toHaveProperty("id");
    expect(withdrawOperation.user_id).toBe(user.id);
  });

  it("should not be able to create a statement for a non-existing user", () => {
    const fakeId = "c17a0c25-cdbc-47a8-8e4d-6b1d07f4e7dc";

    expect(async () => {
      await createStatementUseCase.execute({ 
        amount: 100, 
        description: "Deposit Test", 
        type: OperationType.DEPOSIT, 
        user_id: fakeId
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a withdraw operation if user has insufficient funds", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({name: "Test", email: "test@mail.com", password: "123456"});
  
      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 50,
        description: "Withdraw Test",
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

});

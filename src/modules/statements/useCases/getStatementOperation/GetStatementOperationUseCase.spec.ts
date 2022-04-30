import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}


describe("Get Statement Operation", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get a user's statement operation", async () => {

    const user = await createUserUseCase.execute({name: "Test", email: "test@mail.com", password: "123456"});

     await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 200,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });

     await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 50,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string, 
      statement_id: deposit.id as string, 
    });
    
    expect(statementOperation.user_id).toBe(user.id);
    expect(statementOperation.id).toBe(deposit.id);
    expect(statementOperation).toBe(deposit);

  });

  it("should not be able to get statement for a non-existing user", async () => {
    const fakeUserId = "c17a0c25-cdbc-47a8-8e4d-6b1d07f4e7dc";
    const fakeStatementId = "fbaec84f-97d3-47f0-b362-965990cb2ca2";

    expect(async() => {
      await getStatementOperationUseCase.execute({
        user_id: fakeUserId, 
        statement_id: fakeStatementId, 
      });
      
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });


  it("should not be able to get a non-existing statement", async () => {
    const fakeStatementId = "fbaec84f-97d3-47f0-b362-965990cb2ca2";

    expect(async() => {
      const user = await createUserUseCase.execute({name: "Test", email: "test@mail.com", password: "123456"});
      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 100,
        description: "Deposit Test",
        type: OperationType.DEPOSIT,
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string, 
        statement_id: fakeStatementId, 
      });
      
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

});
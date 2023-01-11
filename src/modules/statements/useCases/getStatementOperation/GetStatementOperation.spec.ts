import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { User } from "../../../users/entities/User";
import { OperationType } from "@modules/statements/entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { Statement } from "../../entities/Statement";

let user: User;
let statement: Statement;

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let statementsRepositoryInMemory: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Get balance", () => {
  beforeEach(async() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

    user = await createUserUseCase.execute({
      name: "marcel",
      email: "marcel@test.com",
      password: "12345"
    });

    statement = await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 100,
      description: "Test deposit",
      type: OperationType.DEPOSIT
    });
  });

  it("Should be able to get balance a statement operation", async() => {
    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id)
    });

    expect(statementOperation).toBe(statement);
  });

  it("Should not be able to get a statement operation for a non-existent user", async() => {
    expect(async() => {
      await getStatementOperationUseCase.execute({
        user_id: "error",
        statement_id: String(statement.id)
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get a statement operation for a non-existent statement", async() => {
    expect(async() => {
      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: "error"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});

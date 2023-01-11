import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { User } from "../../../users/entities/User";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { OperationType } from "@modules/statements/entities/Statement";
import { CreateStatementError } from "./CreateStatementError";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";

let user: User;

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: IStatementsRepository;

describe("Create statement", () => {
  beforeEach(async() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

    user = await createUserUseCase.execute({
      name: "marcel",
      email: "marcel@test.com",
      password: "12345"
    });
  });

  it("Should be able to create a new deposit or withdraw", async() => {
    let newStatement: ICreateStatementDTO = {
      user_id: String(user.id),
      amount: 100,
      description: "Test deposit",
      type: OperationType.DEPOSIT
    };

    let createdStatement = await createStatementUseCase.execute(newStatement);

    expect(createdStatement).toHaveProperty("id");
    expect(createdStatement.amount).toBe(100);
    expect(createdStatement.type).toBe(OperationType.DEPOSIT);

    newStatement = {
      user_id: String(user.id),
      amount: 50,
      description: "Test withdraw",
      type: OperationType.WITHDRAW
    };

    createdStatement = await createStatementUseCase.execute(newStatement);

    expect(createdStatement).toHaveProperty("id");
    expect(createdStatement.amount).toBe(50);
    expect(createdStatement.type).toBe(OperationType.WITHDRAW);
  });

  it("Should not be able to create a new withdraw or deposit to a non-existent user", async() => {
    const newStatement: ICreateStatementDTO = {
      user_id: "error",
      amount: 100,
      description: "Test deposit",
      type: OperationType.DEPOSIT
    };

    expect(async() => {
      await createStatementUseCase.execute(newStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to create a withdraw with amount greater than balance", async() => {
    const newStatement: ICreateStatementDTO = {
      user_id: String(user.id),
      amount: 100,
      description: "Test withdraw",
      type: OperationType.WITHDRAW
    };

    expect(async() => {
      await createStatementUseCase.execute(newStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});

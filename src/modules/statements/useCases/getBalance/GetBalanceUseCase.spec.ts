import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { User } from "../../../users/entities/User";
import { OperationType } from "@modules/statements/entities/Statement";
import { GetBalanceError } from "./GetBalanceError";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

let user: User;

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let statementsRepositoryInMemory: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Get balance", () => {
  beforeEach(async() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

    user = await createUserUseCase.execute({
      name: "marcel",
      email: "marcel@test.com",
      password: "12345"
    });
  });

  it("Should be able to get balance", async() => {
    let balance = await getBalanceUseCase.execute({
      user_id: String(user.id)
    });

    expect(balance.balance).toBe(0);
    expect(balance.statement).toHaveLength(0);

    const newStatement: ICreateStatementDTO = {
      user_id: String(user.id),
      amount: 100,
      description: "Test deposit",
      type: OperationType.DEPOSIT
    };

    const createdStatement = await createStatementUseCase.execute(newStatement);

    balance = await getBalanceUseCase.execute({
      user_id: String(user.id)
    });

    expect(balance.balance).toBe(100);
    expect(balance.statement).toHaveLength(1);
    expect(balance.statement[0].id).toBe(createdStatement.id);
  });

  it("Should not be able to get balance for a non-existent user", async() => {
    expect(async() => {
      await getBalanceUseCase.execute({
        user_id: "error"
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});

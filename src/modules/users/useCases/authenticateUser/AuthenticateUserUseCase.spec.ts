import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { User } from "../../entities/User";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: IUsersRepository;

let user: User;

describe("Authenticate user", () => {
  beforeEach(async() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);

    user = await createUserUseCase.execute({
      name: "marcel",
      email: "marcel@test.com",
      password: "12345"
    });
  });

  it("Should be able to authenticate user", async() => {
    const credentials = {
      email: "marcel@test.com",
      password: "12345"
    };

    const res = await authenticateUserUseCase.execute(credentials);

    expect(res.user.id).toBe(user.id);
    expect(res.token).not.toBeUndefined();
  });

  it("Should not be able to authenticate user with incorrect password", async() => {
    const credentials = {
      email: "marcel@test.com",
      password: "error"
    };

    expect(async() => {
      await authenticateUserUseCase.execute(credentials);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate user with incorrect email", async() => {
    const credentials = {
      email: "error@test.com",
      password: "12345"
    };

    expect(async() => {
      await authenticateUserUseCase.execute(credentials);
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});

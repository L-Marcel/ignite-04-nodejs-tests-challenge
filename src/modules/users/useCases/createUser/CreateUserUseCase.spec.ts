import { CreateUserUseCase } from "./CreateUserUseCase";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "./ICreateUserDTO";
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: IUsersRepository;

describe("Create user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to create a new user", async() => {
    const newUser: ICreateUserDTO = {
      name: "marcel",
      email: "marcel@test.com",
      password: "12345"
    };

    const createdUser = await createUserUseCase.execute(newUser);

    expect(createdUser).toHaveProperty("id");
    expect(createdUser.name).toBe(newUser.name);
  });

  it("Should not be able to create a duplicated user", async() => {
    const newUser: ICreateUserDTO = {
      name: "marcel",
      email: "marcel@test.com",
      password: "12345"
    };

    const createdUser = await createUserUseCase.execute(newUser);

    expect(async() => {
      await createUserUseCase.execute(newUser);
    }).rejects.toBeInstanceOf(CreateUserError);

    expect(createdUser).toHaveProperty("id");
    expect(createdUser.name).toBe(newUser.name);
  });
});

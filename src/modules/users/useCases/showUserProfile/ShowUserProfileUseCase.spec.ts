import { IUsersRepository } from "../../repositories/IUsersRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { User } from "../../entities/User";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";

let showUserProfileUserUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: IUsersRepository;

let user: User;

describe("Show user profile", () => {
  beforeEach(async() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    showUserProfileUserUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);

    user = await createUserUseCase.execute({
      name: "marcel",
      email: "marcel@test.com",
      password: "12345"
    });
  });

  it("Should be able to get user profile", async() => {
    const userProfile = await showUserProfileUserUseCase.execute(String(user.id));
    expect(userProfile).toBe(user);
  });

  it("Should not be able to get user profile when user is not authorized", async() => {
    expect(async() => {
      await showUserProfileUserUseCase.execute("error");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});

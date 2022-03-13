import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { getRepository, Repository } from "typeorm";
import { Project } from "../data/entities/project";
import { User } from "../data/entities/user";
import { sendError } from "../errorResponse";

const onProjectUpdated = async (project: Project, projectRepository: Repository<Project>) => {
  await projectRepository.update({ id: project.id }, { lastEdited: new Date() });
};

export const getProjects = async (request: Request, response: Response) => {
  const projectRepository = getRepository(Project);
  const userRepository = getRepository(User);
  const username = request.params.username;

  const user = await userRepository.findOne({ username });

  if (!user) {
    sendError(request, response, StatusCodes.BAD_REQUEST, "User does not exist.");
    return;
  }

  const projects = await projectRepository.find({ user: user.id });

  const res = projects.map((project) => {
    return {
      name: project.name,
      description: project.description,
      tags: project.tags,
      lastEdited: new Date(project.lastEdited)
    };
  });

  response.send(res);
};

export const getProjectByName = async (
  request: Request,
  response: Response
) => {
  const userRepository = getRepository(User);
  const username = request.params.username;
  const projectName = request.params.project;

  const user = await userRepository.findOne({ username });
  if (!user) {
    sendError(request, response, StatusCodes.BAD_REQUEST, "User does not exist.");
    return;
  }

  const projectRepository = getRepository(Project);
  const project = await projectRepository.findOne(
    {
      user: user.id,
      name: projectName
    }
  );
  if (!project) {
    sendError(request, response, StatusCodes.BAD_REQUEST, "User does not have a project with that name.");
    return;
  }

  const res = {
    name: project.name,
    description: project.description,
    startingBalance: project.startingBalance ? Number(project.startingBalance) : null,
    tags: project.tags,
    lastEdited: new Date(project.lastEdited),
    risk: project.risk ? Number(project.risk) : null
  };

  response.send(res);
};

export const createProject = async (request: Request, response: Response) => {
  const projectRepository = getRepository(Project);
  let name = request.body.name;
  const description = request.body.description;
  const startingBalance = request.body.startingBalance;
  const tags = request.body.tags;
  const userId = request.body.userId;

  // Check that the user does not already have a project with this name.
  const projectExists = await projectRepository.findOne({ name, user: userId });
  if (projectExists) {
    sendError(request, response, StatusCodes.BAD_REQUEST, "A project with that name already exists.");
    return;
  }

  // Trim whitespace from name.
  name = name.trim();

  const project = {
    name,
    description,
    startingBalance: startingBalance ? startingBalance : null,
    tags: tags ? tags : [],
    user: userId,
    lastEdited: new Date()
  };

  projectRepository
    .save(project)
    .then(async () => {
      const user = await getRepository(User).findOne({ id: userId });
      response.send({
        projectUrl: `/${user.username}/${project.name}`
      });
    })
    .catch((error) => {
      console.log(`Failed to create project ${error.message}`);
      sendError(request, response, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create project.");
    });
};

export const updateProject = async (request: Request, response: Response) => {
  const userRepository = getRepository(User);
  const username = request.params.username;
  const projectName = request.params.project;

  const user = await userRepository.findOne({ username });
  if (!user) {
    sendError(request, response, StatusCodes.BAD_REQUEST, "User does not exist.");
    return;
  }

  const projectRepository = getRepository(Project);
  const project = await projectRepository.findOne(
    {
      user: user.id,
      name: projectName
    }
  );
  if (!project) {
    sendError(request, response, StatusCodes.BAD_REQUEST, "User does not have a project with that name.");
    return;
  }

  try {
    delete request.body.userId;
    const updatedData: Project = request.body;

    await projectRepository.update({
      user: user.id,
      name: projectName
    }, updatedData);

    await onProjectUpdated(project, projectRepository);

    response.sendStatus(StatusCodes.NO_CONTENT);
  }
  catch (error) {
    console.log(error.message);
    sendError(request, response, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update project.");
  }
};

export const deleteProject = async (request: Request, response: Response) => {
  const userRepository = getRepository(User);
  const username = request.params.username;
  const projectName = request.params.project;

  const user = await userRepository.findOne({ username });
  if (!user) {
    sendError(request, response, StatusCodes.BAD_REQUEST, "User does not exist.");
    return;
  }

  try {
    const projectRepository = getRepository(Project);
    await projectRepository.delete({
      user: user.id,
      name: projectName
    });

    response.sendStatus(StatusCodes.NO_CONTENT);
  }
  catch (error) {
    console.log(error.message);
    sendError(request, response, StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete project.");
  }
};
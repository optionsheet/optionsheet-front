import styled from "styled-components";
import { Link } from "react-router-dom";
import { Tag } from "../../common/models/tag";
import { TagPill } from "../shared/pill";
import moment from "moment";

const ProjectCardDiv = styled.div`
  margin: 0.5rem 0.5rem 0.5rem 0;
  padding: 1rem 1rem 1rem 0;
  border-top: 1px solid ${props => props.theme.dark.border};
  border-radius: 5px;
  transition: background-color 0.2s ease;

  &:first-child {
    margin-top: 0;
  }

  a.trade-link {
    color: ${props => props.theme.dark.text};
    
    h1 {
      margin-bottom: 0;
      font-weight: 600;
    }
  }

  .project-link {
    font-size: 16px;
  }

  .tags {
    margin-top: 1rem;
  }
`;

export interface ProjectCardProps {
  id: number;
  name: string;
  description: string;
  lastEdited: Date;
  user: {
    username: string;
  }
  tags: Tag[];
  trades: number;
}

const ProjectCard = ({ project }: { project: ProjectCardProps }) => {
  if (!(project && project.user)) {
    return null;
  }

  return (
    <ProjectCardDiv>
      {/* Link to project */}
      <Link to={`/${project.user.username}/${project.name}`} className="project-link">
        {project.user.username}/{project.name}
      </Link>

      {/* Description */}
      <p>{project.description}</p>

      {/* Tags */}
      <div className="tags">
        {project.tags.map((tag) => (
          <TagPill key={tag.name}>{tag.name}</TagPill>
        ))}
      </div>

      {/* Last edited date */}
      <p>
        <small>Last edited {moment(new Date(project.lastEdited)).fromNow()}</small>
      </p>
    </ProjectCardDiv>
  );
};

export default ProjectCard;
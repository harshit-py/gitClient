from fastapi import APIRouter
from pydantic import BaseModel
from git import Repo, InvalidGitRepositoryError
from fastapi import HTTPException
from typing import List, Optional
import os

router = APIRouter()

class CommitInfo(BaseModel):
    hash: str
    message: str
    author: str
    date: str

class FileChange(BaseModel):
    path: str
    status: str
    diff: Optional[str] = None
    staged: bool = False

class FileContent(BaseModel):
    content: str

class FileTreeItem(BaseModel):
    path: str
    type: str  # 'file' or 'dir'
    children: Optional[List['FileTreeItem']] = None

class RepoInfo(BaseModel):
    current_branch: str
    branches: List[str]

def get_repo():
    # For demo, we'll use the current directory's git repo
    try:
        return Repo(os.getcwd())
    except InvalidGitRepositoryError:
        raise HTTPException(
            status_code=404,
            detail="No Git repository found in the current directory. Please ensure you're in a valid Git repository."
        )

@router.get("/repo-info")
def get_repo_info() -> RepoInfo:
    repo = get_repo()
    return RepoInfo(
        current_branch=repo.active_branch.name,
        branches=[branch.name for branch in repo.branches]
    )

@router.get("/commits")
def get_commits(limit: int = 10) -> List[CommitInfo]:
    repo = get_repo()
    commits = []
    for commit in repo.iter_commits(max_count=limit):
        commits.append(CommitInfo(
            hash=commit.hexsha,
            message=commit.message,
            author=f"{commit.author.name} <{commit.author.email}>",
            date=commit.committed_datetime.isoformat()
        ))
    return commits

@router.get("/file-changes")
def get_file_changes(commit_hash: str) -> List[FileChange]:
    repo = get_repo()
    commit = repo.commit(commit_hash)
    parent = commit.parents[0] if commit.parents else None
    
    changes = []
    if parent:
        diffs = parent.diff(commit)
        for diff in diffs:
            changes.append(FileChange(
                path=diff.a_path or diff.b_path,
                status=diff.change_type,
                diff=diff.diff.decode('utf-8') if diff.diff else None
            ))
    return changes

def build_tree(paths: List[str]) -> List[FileTreeItem]:
    root = {}
    for path in paths:
        current = root
        parts = path.split('/')
        for i, part in enumerate(parts):
            if part not in current:
                is_file = i == len(parts) - 1
                current[part] = {
                    'type': 'file' if is_file else 'dir',
                    'children': {} if not is_file else None
                }
            current = current[part].get('children', {})
    
    def dict_to_tree(d: dict, name: str) -> FileTreeItem:
        return FileTreeItem(
            path=name,
            type=d['type'],
            children=[dict_to_tree(v, k) for k, v in d.get('children', {}).items()] or None
        )
    
    return [dict_to_tree(v, k) for k, v in root.items()]

@router.get("/file-content")
def get_file_content(path: str) -> FileContent:
    repo = get_repo()
    try:
        # Get the file content from the current branch
        blob = repo.head.commit.tree[path]
        content = blob.data_stream.read().decode('utf-8')
        return FileContent(content=content)
    except (KeyError, UnicodeDecodeError):
        raise HTTPException(
            status_code=404,
            detail=f"File not found or is not a text file: {path}"
        )

@router.get("/working-changes")
def get_working_changes() -> List[FileChange]:
    repo = get_repo()
    changes = []
    
    # Get staged changes
    staged = repo.index.diff(repo.head.commit)
    for diff in staged:
        changes.append(FileChange(
            path=diff.a_path or diff.b_path,
            status=diff.change_type,
            diff=diff.diff.decode('utf-8') if diff.diff else None,
            staged=True
        ))
    
    # Get unstaged changes
    unstaged = repo.index.diff(None)
    for diff in unstaged:
        changes.append(FileChange(
            path=diff.a_path or diff.b_path,
            status=diff.change_type,
            diff=diff.diff.decode('utf-8') if diff.diff else None,
            staged=False
        ))
    
    # Get untracked files
    untracked = repo.untracked_files
    for path in untracked:
        try:
            with open(os.path.join(repo.working_dir, path), 'r') as f:
                content = f.read()
            changes.append(FileChange(
                path=path,
                status='A',  # Added
                diff=f'+++ b/{path}\n@@ -0,0 +1,{len(content.splitlines())} @@\n{content}',
                staged=False
            ))
        except (UnicodeDecodeError, IOError):
            # Skip binary files or files that can't be read
            changes.append(FileChange(
                path=path,
                status='A',  # Added
                diff=None,
                staged=False
            ))
    
    return changes

@router.get("/file-tree")
def get_file_tree() -> List[FileTreeItem]:
    repo = get_repo()
    files = [item.path for item in repo.tree().traverse()]
    return build_tree(files)


import { User, SystemInfo, GitCommit, GitFileStatus, GitDiffLine, FileSystemItem, FileType, Department, Developer, Role, Permission, Resource } from '../types';
import { MOCK_DEPARTMENTS, MOCK_DEVELOPERS, MOCK_ROLES, MOCK_PERMISSIONS, MOCK_TEMPLATE_LIST, MOCK_ORGANIZATIONS, MOCK_RESOURCES } from '../constants';

// --- Auth & System ---

export const login = async (username: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'u1',
        name: username === 'admin' ? 'Administrator' : 'User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        role: 'admin'
      });
    }, 800);
  });
};

export const changePassword = async (oldPw: string, newPw: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const getSystemInfo = async (): Promise<SystemInfo> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                productName: 'Nebula LowCode',
                version: '2.5.0',
                edition: 'Enterprise',
                serviceValidUntil: '2025-12-31',
                licenseValidUntil: '2025-12-31',
                copyright: '© 2024 Nebula Inc.'
            });
        }, 500);
    });
};

// --- Project Management ---

export const createProject = async (data: any): Promise<any> => {
    return new Promise((resolve) => setTimeout(() => resolve({ id: Date.now(), ...data }), 1500));
};

export const updateProject = async (id: number, data: any): Promise<any> => {
    return new Promise((resolve) => setTimeout(() => resolve({ id, ...data }), 1000));
};

export const deleteProject = async (id: number, options?: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
};

export const copyProject = async (id: number): Promise<any> => {
    return new Promise((resolve) => setTimeout(() => resolve({ id: Date.now() }), 1000));
};

export const getProjectMembers = async (): Promise<any[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
        { id: 101, name: 'Alice', role: 'Owner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
        { id: 102, name: 'Bob', role: 'Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        { id: 103, name: 'Charlie', role: 'Viewer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' }
    ]), 500));
};

export const getProjectDeleteInfo = async (id: number): Promise<any> => {
    return new Promise((resolve) => setTimeout(() => resolve({
        name: 'Project X',
        size: '150 MB',
        stats: { frontend: {}, backend: {}, database: {}, config: {} }
    }), 1000));
};

// --- Templates ---

export const getTemplates = async (): Promise<any[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_TEMPLATE_LIST), 500));
};

export const createTemplate = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const updateTemplate = async (id: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const deleteTemplate = async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 500));
};

// --- Organizations ---

export const getOrganizations = async (): Promise<any[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_ORGANIZATIONS), 600));
};

export const createOrganization = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const updateOrganization = async (id: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const deleteOrganization = async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 500));
};

// --- Departments ---

export const getDepartments = async (): Promise<Department[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_DEPARTMENTS), 600));
};

export const createDepartment = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
};

export const updateDepartment = async (id: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
};

export const deleteDepartment = async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 600));
};

// --- Developers ---

export const getDevelopers = async (): Promise<Developer[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_DEVELOPERS), 600));
};

export const createDeveloper = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
};

export const updateDeveloper = async (id: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
};

export const deleteDeveloper = async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 600));
};

// --- Roles & Permissions ---

export const getRoles = async (): Promise<Role[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_ROLES), 600));
};

export const getPermissions = async (): Promise<Permission[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PERMISSIONS), 400));
};

export const createRole = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
};

export const updateRole = async (id: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
};

export const deleteRole = async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 600));
};

// --- Resources ---

export const getResources = async (): Promise<Resource[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_RESOURCES), 700));
};

export const createResource = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const updateResource = async (id: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const deleteResource = async (id: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 600));
};

// --- File System / Project Designer ---

const mockFiles: Record<string, FileSystemItem[]> = {
    pages: [
        { id: 'p1', name: 'Home', type: 'folder', children: [{ id: 'p1_1', name: 'index.tsx', type: 'frontend' }, { id: 'p1_2', name: 'style.css', type: 'file' }] },
        { id: 'p2', name: 'Login', type: 'folder', children: [{ id: 'p2_1', name: 'Login.tsx', type: 'frontend' }] }
    ],
    apps: [
        { id: 'a1', name: 'MobileMain', type: 'folder', children: [{ id: 'a1_1', name: 'App.tsx', type: 'frontend' }] }
    ],
    apis: [
        { id: 'api1', name: 'User', type: 'folder', children: [{ id: 'api1_1', name: 'getUser', type: 'backend' }, { id: 'api1_2', name: 'updateUser', type: 'backend' }] }
    ],
    models: [
        // Initial Mock Database Connection
        { 
            id: 'db_main', 
            name: 'Main Database', 
            type: 'dbConnection', // Special type for DB root
            children: [
                { id: 'db_main_tables', name: 'Tables', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_views', name: 'Views', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_funcs', name: 'Functions', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_procs', name: 'Procedures', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_trigs', name: 'Triggers', type: 'dbGroup', children: [], parentId: 'db_main' },
                { id: 'db_main_queries', name: 'Queries', type: 'dbGroup', children: [], parentId: 'db_main' },
            ]
        }
    ],
    external: [
        { id: 'ext1', name: 'ERP System', type: 'externalSys', children: [{ id: 'ext1_1', name: 'SyncOrder', type: 'externalApi' }] }
    ]
};

export const fetchProjectFiles = async (projectId: string, type: string): Promise<FileSystemItem[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockFiles[type] || []), 400));
};

// Lazy loading for Database items
export const fetchChildNodes = async (parentId: string, type: string): Promise<FileSystemItem[]> => {
    console.log(`[Mock] Loading children for ${parentId} of type ${type}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (parentId.endsWith('_tables')) {
                resolve([
                    { id: `${parentId}_1`, name: 'sys_users', type: 'dbTable', parentId },
                    { id: `${parentId}_2`, name: 'sys_roles', type: 'dbTable', parentId },
                    { id: `${parentId}_3`, name: 'biz_orders', type: 'dbTable', parentId },
                ]);
            } else if (parentId.endsWith('_views')) {
                resolve([
                    { id: `${parentId}_1`, name: 'v_user_stats', type: 'dbView', parentId },
                ]);
            } else if (parentId.endsWith('_funcs')) {
                resolve([
                    { id: `${parentId}_1`, name: 'fn_get_org_path', type: 'dbFunc', parentId },
                ]);
            } else {
                resolve([]);
            }
        }, 600);
    });
};

export const createNode = async (projectId: string, rootType: string, parentId: string | null, data: any): Promise<FileSystemItem> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newId = `node_${Date.now()}`;
            
            // Special handling for creating a new Database Connection
            if (rootType === 'models' && !parentId) {
                const dbChildren: FileSystemItem[] = [
                    { id: `${newId}_tables`, name: 'Tables', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_views`, name: 'Views', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_funcs`, name: 'Functions', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_procs`, name: 'Procedures', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_trigs`, name: 'Triggers', type: 'dbGroup', children: [], parentId: newId },
                    { id: `${newId}_queries`, name: 'Queries', type: 'dbGroup', children: [], parentId: newId },
                ];
                
                const newNode: FileSystemItem = { 
                    id: newId, 
                    name: data.name, 
                    type: 'dbConnection', // Force type for root models
                    children: dbChildren
                };
                
                // Update local mock store for persistence in session
                if (mockFiles['models']) mockFiles['models'].push(newNode);
                
                resolve(newNode);
                return;
            }

            // Normal creation
            resolve({ 
                id: newId, 
                name: data.name, 
                type: data.type,
                children: data.type === 'folder' ? [] : undefined
            });
        }, 500);
    });
};

export const updateNode = async (projectId: string, nodeId: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 400));
};

export const deleteNode = async (projectId: string, nodeId: string): Promise<void> => {
    return new Promise((resolve) => {
        // Mock deletion by filtering out the node from the top-level lists
        Object.keys(mockFiles).forEach(key => {
            mockFiles[key] = mockFiles[key].filter(item => item.id !== nodeId);
        });
        setTimeout(resolve, 400);
    });
};

export const moveNode = async (projectId: string, draggedId: string, targetId: string, rootType: string): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 400));
};

export const copyNode = async (projectId: string, nodeId: string): Promise<FileSystemItem> => {
    return new Promise((resolve) => setTimeout(() => resolve({
        id: `copy_${nodeId}_${Date.now()}`,
        name: 'Copy of Node',
        type: 'file'
    }), 500));
};

// --- Git ---

export const fetchGitChanges = async (): Promise<GitFileStatus[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
        { id: 'f1', name: 'src/components/Header.tsx', status: 'modified', leftLines: [], rightLines: [] },
        { id: 'f2', name: 'src/utils/api.ts', status: 'modified', leftLines: [], rightLines: [] },
        { id: 'f3', name: 'public/logo.svg', status: 'added', leftLines: [], rightLines: [] }
    ]), 800));
};

export const fetchGitHistory = async (): Promise<GitCommit[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([
        { id: 'c1', message: 'feat: add user login', author: 'Dev1', date: '2023-10-25', branch: 'main', files: [] },
        { id: 'c2', message: 'fix: button style', author: 'Dev2', date: '2023-10-24', branch: 'main', files: [] }
    ]), 800));
};

export const performGitAction = async (action: string, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1500));
};

// --- System Interface Config ---

export const saveSystemConfig = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const saveApiConfig = async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
};

// --- Database Config ---

export const saveDatabaseConfig = async (data: any): Promise<void> => {
    console.log("Saving DB Config:", data);
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const testDatabaseConnection = async (data: any): Promise<boolean> => {
    console.log("Testing DB Config:", data);
    return new Promise((resolve) => setTimeout(() => resolve(true), 2000));
};

// --- New Debug API Service ---
export const debugApi = async (params: any): Promise<any> => {
    console.log("Calling Backend API [DEBUG] with params:", params);
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock Response based on simple logic
            const isError = params.url?.includes('error');
            
            if (isError) {
                resolve({
                    success: false,
                    code: 500,
                    error: {
                        message: "Internal Server Error",
                        trace: "java.lang.NullPointerException at com.nebula.api.Controller..."
                    },
                    timestamp: Date.now()
                });
            } else {
                resolve({
                    success: true,
                    code: 200,
                    message: "Operation successful",
                    data: {
                        id: 12345,
                        name: "Mock Entity",
                        status: "active",
                        tags: ["test", "demo"],
                        details: {
                            created_at: "2023-10-27T10:00:00Z",
                            updated_at: "2023-10-28T14:30:00Z",
                            meta: {
                                version: 1,
                                author: "admin"
                            }
                        },
                        receivedParams: {
                            queryParams: params.queryParams,
                            pathParams: params.pathParams,
                            body: params.body ? (typeof params.body === 'string' ? JSON.parse(params.body || '{}') : params.body) : null
                        }
                    },
                    timestamp: Date.now()
                });
            }
        }, 800); // Simulate network delay
    });
};

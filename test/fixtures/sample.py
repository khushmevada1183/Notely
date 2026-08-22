"""Sample Python fixture for integration tests."""

def greet(name: str) -> str:
	return f"Hello, {name}!"

if __name__ == "__main__":
	print(greet("minimal"))

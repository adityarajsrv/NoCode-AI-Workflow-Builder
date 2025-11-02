import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.embeddings import local_embedder, get_model_info

def test_embedding_model():
    print("🧪 Testing Local Embedding Model...")
    
    # Test model info
    info = get_model_info()
    print(f"📊 Model Info: {info}")
    
    # Test embedding generation
    test_texts = [
        "This is a test document about machine learning.",
        "Another test sentence for embedding generation.",
        "The quick brown fox jumps over the lazy dog."
    ]
    
    print(f"📝 Generating embeddings for {len(test_texts)} test texts...")
    
    try:
        embeddings = local_embedder.embed_texts(test_texts)
        print(f"✅ Successfully generated {len(embeddings)} embeddings")
        print(f"📐 Each embedding has {len(embeddings[0])} dimensions")
        print(f"🔢 Sample embedding first 5 values: {embeddings[0][:5]}")
        
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_embedding_model()
    if success:
        print("\n🎉 All tests passed! Local embeddings are working correctly.")
    else:
        print("\n💥 Tests failed. Please check the installation.")